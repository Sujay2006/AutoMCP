"""Gemini action extractor — port of automcp/lib/scanner/extract.ts.

Same system prompt as the TS version so both backends produce the same output
for the same input.
"""

from __future__ import annotations

from typing import Any

from app.clients.gemini import call_gemini
from app.models import ActionInput, ContentType, DetectedAction
from app.scanner.filter import SourceFile

SYSTEM_PROMPT = """You are analyzing a software project to identify what user-facing actions it supports, with enough fidelity that an AI agent could actually call those endpoints later.

OUTPUT: a JSON object of shape { "actions": [ ... ] } and nothing else.

For each action, output every field below.

- name (string, snake_case): a verb-first identifier.
- description (string, one sentence, plain English): what the action does from the user's perspective.
- http_method (string): GET, POST, PUT, DELETE, or PATCH — the exact method this endpoint accepts.
- path (string OR null): the COMPLETE URL path from the application root, INCLUDING any framework prefix like /api, /api/v1, /v1, /rest. To find this:
    * Read routing config files (e.g. application/config/routes.php, routes/api.php, urls.py, app/api/, config/routes.rb, server.js).
    * If the framework auto-prefixes (Laravel's routes/api.php gets a "/api" prefix, Django REST's DefaultRouter may add a base, Express `app.use("/api", router)` etc.), include that prefix.
    * Do NOT invent a path from the action name. If you cannot determine the real path with high confidence, output null.
- inputs (array): { "name": string, "type": string, "description": string }. The likely input parameters; if path uses placeholders like /:id or {id}, list them here.
- output_description (string): what the action returns, in plain English.
- is_write (boolean): true if the action creates, modifies, or deletes data.
- requires_auth (boolean): true if the endpoint sits behind auth middleware (look for middleware('auth'), @login_required, before_filter :authenticate, passport/session checks, JWT verification). false if explicitly public.
- content_type (string): one of "application/json" or "application/x-www-form-urlencoded". Modern REST APIs and JSON-returning endpoints use application/json. Classic PHP form posts (legacy CodeIgniter/InvoicePlane controllers reading $_POST, Laravel form actions, WordPress admin-ajax) use application/x-www-form-urlencoded.
- source_file (string): the file you found this in.
- confidence (number, 0-1): how sure you are this is a real, callable endpoint. If path is null, set confidence to 0.

RULES:
- ALWAYS prefer real paths over guessed ones. A null path is more useful than a fake one — downstream code flags nulls for the user to fill in.
- Only include user-facing actions. Skip admin-only routes, internal utilities, health checks, middleware, callback URLs, asset routes, debug endpoints.
- Prefer coarse-grained actions (e.g., "create_order") over fine-grained ones (e.g., "validate_cart_step_3").
- Skip duplicates. If the same action appears in multiple files, list it once with the most authoritative source_file.
- Maximum 20 actions per response. Quality over quantity."""


async def extract_actions(
    project_type: str, files: list[SourceFile]
) -> list[DetectedAction]:
    """Extract user-facing actions from a project's source files in one Gemini call."""
    file_text = "\n\n".join(
        f"### {f.path}\n```\n{f.content}\n```" for f in files
    )
    user_message = (
        f"Project type: {project_type}\n\n"
        f"Source files ({len(files)} files included):\n\n"
        f"{file_text}\n\n"
        'Output the JSON object with the "actions" array.'
    )
    parsed: Any = await call_gemini(SYSTEM_PROMPT, user_message)
    raw = parsed.get("actions") if isinstance(parsed, dict) else []
    if not isinstance(raw, list):
        return []
    return [_normalize_action(a) for a in raw if isinstance(a, dict)]


def _normalize_action(a: dict[str, Any]) -> DetectedAction:
    """Defend against minor LLM schema drift. Enforces path-null/confidence-0
    contract and supplies safe defaults for any field the model forgot."""
    path_raw = a.get("path")
    path = path_raw if isinstance(path_raw, str) and path_raw.strip() else None

    confidence_raw = a.get("confidence", 0) or 0
    try:
        confidence = float(confidence_raw)
    except (TypeError, ValueError):
        confidence = 0.0
    if path is None:
        confidence = 0.0
    if not (0.0 <= confidence <= 1.0):
        confidence = 0.0

    ct_raw = str(a.get("content_type") or "application/json")
    ct: ContentType = (
        "application/x-www-form-urlencoded"
        if ct_raw == "application/x-www-form-urlencoded"
        else "application/json"
    )

    inputs_raw = a.get("inputs") or []
    inputs = []
    if isinstance(inputs_raw, list):
        for i in inputs_raw:
            if isinstance(i, dict):
                inputs.append(
                    ActionInput(
                        name=str(i.get("name", "")),
                        type=str(i.get("type", "")),
                        description=str(i.get("description", "")),
                    )
                )

    return DetectedAction(
        name=str(a.get("name", "unnamed_action")),
        description=str(a.get("description", "")),
        http_method=str(a.get("http_method", "GET")).upper(),
        path=path,
        inputs=inputs,
        output_description=str(a.get("output_description", "")),
        is_write=bool(a.get("is_write", False)),
        requires_auth=bool(a.get("requires_auth", False)),
        content_type=ct,
        source_file=str(a.get("source_file", "")),
        confidence=confidence,
    )
