"""Worker code renderer — port of automcp/lib/generator/code-renderer.ts.

Output is TypeScript/JavaScript for Cloudflare Workers. This module is pure
text substitution — Python's only job is to inject JSON-valued constants into
the template. The template's MCP-over-HTTP plumbing is the same one used by
the Next.js backend (templates/mcp-server.ts.tmpl is the single source of
truth).
"""

from __future__ import annotations 
""" It's a Python feature toggle, not a library import — __future__ is a special module that lets you opt a single file into a behavior that will be (or once was) the default in a later Python version. The specific one you're looking at — annotations — changes how Python evaluates type hints. """

import datetime as _dt
import json
from pathlib import Path
from typing import Any

from app.models import (
    AuthCredentials,
    AuthType,
    ConfirmedTool,
    ProposedTool,
    ToolEndpoint,
)

# backend/templates/mcp-server.ts.tmpl
_TEMPLATE_PATH = (
    Path(__file__).resolve().parents[2] / "templates" / "mcp-server.ts.tmpl"
)


def _load_template() -> str:
    return _TEMPLATE_PATH.read_text(encoding="utf-8")


def _tool_to_dict(t: ProposedTool | ConfirmedTool) -> dict[str, Any]:
    return {
        "name": t.name,
        "description": t.description,
        "inputSchema": t.inputSchema.model_dump(),
    }


def _endpoint_to_dict(e: ToolEndpoint) -> dict[str, Any]:
    return e.model_dump()


async def render_mcp_server(
    *,
    source_url: str,
    server_name: str,
    tools: list[ProposedTool | ConfirmedTool],
    api_base: str | None = None,
    auth_type: AuthType = "none",
    auth_credentials: AuthCredentials | None = None,
    tool_endpoints: dict[str, ToolEndpoint] | None = None,
    mock: dict[str, Any] | None = None,
) -> str:
    """Render a complete deployable Cloudflare Worker from project config."""
    template = _load_template()

    tools_json = json.dumps([_tool_to_dict(t) for t in tools], indent=2)

    creds_dict: dict[str, Any] = (
        auth_credentials.model_dump(exclude_none=True)
        if auth_credentials is not None
        else {}
    )
    auth_json = json.dumps({"type": auth_type, "credentials": creds_dict}, indent=2)

    endpoints_dict = {
        name: _endpoint_to_dict(e) for name, e in (tool_endpoints or {}).items()
    }
    endpoints_json = json.dumps(endpoints_dict, indent=2)

    mock_json = json.dumps(mock or {}, indent=2)

    timestamp = (
        _dt.datetime.now(tz=_dt.timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z")
    )

    return (
        template
        .replace("{{TIMESTAMP}}", timestamp)
        .replace("{{SERVER_NAME}}", json.dumps(server_name))
        .replace("{{SOURCE_URL}}", json.dumps(source_url))
        .replace("{{API_BASE}}", json.dumps(api_base or ""))
        .replace("{{AUTH_JSON}}", auth_json)
        .replace("{{TOOLS_JSON}}", tools_json)
        .replace("{{TOOL_ENDPOINTS_JSON}}", endpoints_json)
        .replace("{{MOCK_JSON}}", mock_json)
    )
