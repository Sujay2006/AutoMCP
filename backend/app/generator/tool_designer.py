"""Groq tool designer — port of automcp/lib/generator/tool-designer.ts.

Same system prompt and JSON-schema normalization as the TS version, so output
is identical for the same input.
"""

from __future__ import annotations

import json
from typing import Any

from app.clients.groq import call_groq
from app.models import (
    ContentType,
    DetectedAction,
    JsonSchema,
    JsonSchemaProperty,
    ProposedTool,
)

SYSTEM_PROMPT = """You are designing a Model Context Protocol (MCP) tool set for an AI agent to use.

You'll receive a list of detected actions from a website's codebase. Your job is to turn them into 5-10 well-named, clearly-described MCP tools that an AI agent can use effectively.

For each tool, output:
- name: clear, action-oriented, snake_case (e.g., "search_products" not "products_endpoint")
- description: written FOR an AI agent to read. Explain WHAT it does, WHEN to call it, and what it returns. 1-3 sentences. The agent decides whether to call your tool based on this description — make it count.
- inputSchema: JSON Schema describing the inputs. Must be an object with "type": "object", a "properties" map (each property has "type" and a "description"), and a "required" array.
- is_write: true if it modifies data
- source_action: array of detected action names this tool corresponds to

DESIGN PRINCIPLES:
1. Coarse beats fine. Merge related actions. "place_order" is better than four separate cart, address, payment, and confirm tools. An agent makes one decision well; it makes five decisions badly.
2. Names are commands. Verb-first. "create_invoice" not "invoice_create".
3. Descriptions are sales pitches. The agent decides whether to use your tool based on the description. Be explicit: "Use this when the user wants to..."
4. Skip internal stuff. No admin endpoints, no internal utilities, no health checks.
5. Be honest about write actions. Mark anything that creates, modifies, or deletes data as is_write: true.
6. Maximum 10 tools. Quality over quantity.

OUTPUT FORMAT: a single JSON object with a "tools" key containing the array. Example: { "tools": [...] }. No other text, no markdown."""

# Canonical JSON Schema types per the spec.
CANONICAL_JSON_SCHEMA_TYPES: frozenset[str] = frozenset({
    "string", "number", "integer", "object", "array", "boolean", "null",
})

# LLMs often borrow programming-language type names. Map to canonical JSON Schema.
JSON_SCHEMA_TYPE_ALIASES: dict[str, str] = {
    # integer family
    "int": "integer", "int32": "integer", "int64": "integer",
    "long": "integer", "short": "integer", "byte": "integer",
    "uint": "integer", "uint32": "integer", "uint64": "integer",
    "bigint": "integer",
    # number family
    "float": "number", "float32": "number", "float64": "number",
    "double": "number", "decimal": "number", "real": "number",
    # string family
    "str": "string", "text": "string", "char": "string",
    # boolean family
    "bool": "boolean",
    # array family
    "list": "array", "tuple": "array",
    # object family
    "dict": "object", "map": "object", "hash": "object",
    # null family
    "none": "null", "nil": "null",
}


def canonicalize_type(t: str) -> str:
    lower = t.strip().lower()
    if lower in CANONICAL_JSON_SCHEMA_TYPES:
        return lower
    return JSON_SCHEMA_TYPE_ALIASES.get(lower, lower)


def _normalize_schema_node(node: Any) -> Any:
    """Recursively rewrite `type` fields to canonical JSON Schema types."""
    if not isinstance(node, dict):
        return node
    out = dict(node)
    if isinstance(out.get("type"), str):
        out["type"] = canonicalize_type(out["type"])
    if "items" in out and out["items"] is not None:
        out["items"] = _normalize_schema_node(out["items"])
    if "properties" in out and isinstance(out["properties"], dict):
        out["properties"] = {
            k: _normalize_schema_node(v) for k, v in out["properties"].items()
        }
    return out


def _normalize_tool(t: dict[str, Any]) -> ProposedTool:
    """Defend against minor LLM schema drift; canonicalize non-spec types."""
    raw_schema: dict[str, Any] = (
        t.get("inputSchema") if isinstance(t.get("inputSchema"), dict) else {}
    ) or {"type": "object", "properties": {}}
    normalized = _normalize_schema_node(raw_schema)

    properties_raw = normalized.get("properties") or {}
    properties: dict[str, JsonSchemaProperty] = {}
    if isinstance(properties_raw, dict):
        for k, v in properties_raw.items():
            try:
                properties[str(k)] = JsonSchemaProperty.model_validate(v)
            except Exception:
                # Best effort — drop malformed property rather than fail the whole tool.
                continue

    required = normalized.get("required") or []
    if not isinstance(required, list):
        required = []

    is_write = bool(t.get("is_write") or t.get("writeAction"))
    source_action = t.get("source_action") or []
    if not isinstance(source_action, list):
        source_action = []

    return ProposedTool(
        name=str(t.get("name") or "unnamed_tool"),
        description=str(t.get("description") or ""),
        inputSchema=JsonSchema(
            type="object",
            properties=properties,
            required=[str(r) for r in required],
        ),
        is_write=is_write,
        source_action=[str(s) for s in source_action],
    )


async def design_tools(actions: list[DetectedAction]) -> list[ProposedTool]:
    """Turn raw detected actions into clean MCP tool definitions via Groq."""
    # Cap input — 20 detected actions is plenty for 5-10 designed tools.
    limited = actions[:20]
    user_content = (
        "Detected actions from this website:\n\n"
        f"{json.dumps([a.model_dump() for a in limited], indent=2)}\n\n"
        'Design the MCP tools. Return JSON with a "tools" array.'
    )
    parsed = await call_groq(SYSTEM_PROMPT, user_content)
    raw = parsed.get("tools") if isinstance(parsed, dict) else []
    if not isinstance(raw, list):
        return []
    return [_normalize_tool(t) for t in raw if isinstance(t, dict)]
