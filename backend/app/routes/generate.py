"""POST /api/generate-mcp — render the deployable Worker code.

When the project has no explicit backend_config (the user skipped /connect),
we synthesize one from the scan data so the generated MCP is wired up to
real endpoints out of the box.
"""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException

from app.db import select_project, update_project
from app.demo import AKAUNTING_MOCK
from app.generator.code_renderer import render_mcp_server
from app.models import (
    AuthCredentials,
    BackendConfig,
    ConfirmedTool,
    DetectedAction,
    GenerateMcpRequest,
    GenerateMcpResponse,
    ToolEndpoint,
)

router = APIRouter(tags=["generate"])


def _synthesize_backend_config(
    project: dict[str, Any], enabled_tools: list[ConfirmedTool]
) -> BackendConfig:
    """Build a BackendConfig from scan data when the user skipped /connect.

    For website-source projects, api_base is the source URL's origin so the
    Worker calls back into the same host the user pasted. For github-source
    projects we leave it empty — the Worker template stubs a structured
    response in that case (the repo URL isn't a live API to call).
    """
    source_url: str = project.get("source_url") or ""
    source_type = project.get("source_type")

    api_base = ""
    if source_type == "website" and source_url:
        parsed = urlparse(source_url)
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            api_base = f"{parsed.scheme}://{parsed.netloc}"

    detected_raw = project.get("detected_actions") or []
    actions_by_name: dict[str, DetectedAction] = {}
    for raw in detected_raw:
        try:
            action = DetectedAction.model_validate(raw)
        except Exception:
            continue
        actions_by_name.setdefault(action.name, action)

    tool_endpoints: dict[str, ToolEndpoint] = {}
    for tool in enabled_tools:
        for action_name in tool.source_action:
            action = actions_by_name.get(action_name)
            if action and action.path:
                tool_endpoints[tool.name] = ToolEndpoint(
                    path=action.path,
                    method=action.http_method or "GET",
                    content_type=action.content_type or "application/json",
                    requires_auth=action.requires_auth,
                )
                break

    return BackendConfig(
        api_base=api_base,
        auth_type="none",
        auth_credentials=AuthCredentials(),
        tool_endpoints=tool_endpoints,
    )


@router.post("/generate-mcp", response_model=GenerateMcpResponse)
async def generate_mcp(req: GenerateMcpRequest) -> GenerateMcpResponse:
    project = await select_project(req.projectId)
    if project is None:
        raise HTTPException(404, "Project not found")

    # Resolve tool list — body > confirmed > proposed (all-enabled default).
    if req.confirmedTools:
        tools: list[ConfirmedTool] = req.confirmedTools
    elif project.get("confirmed_tools"):
        tools = [ConfirmedTool.model_validate(t) for t in project["confirmed_tools"]]
    else:
        tools = [
            ConfirmedTool.model_validate({**t, "enabled": True})
            for t in (project.get("proposed_tools") or [])
        ]

    enabled = [t for t in tools if t.enabled]
    if not enabled:
        raise HTTPException(400, "Enable at least one tool before generating")

    is_demo = project.get("source_type") == "akaunting_demo"

    server_name = f"mcp-{str(req.projectId)[:8]}"
    backend_raw = project.get("backend_config")
    if backend_raw:
        backend = BackendConfig.model_validate(backend_raw)
    else:
        backend = _synthesize_backend_config(project, enabled)

    code = await render_mcp_server(
        source_url=project["source_url"],
        server_name=server_name,
        tools=list(enabled),
        api_base=backend.api_base or None,
        auth_type=backend.auth_type,
        auth_credentials=backend.auth_credentials,
        tool_endpoints=backend.tool_endpoints,
        mock=AKAUNTING_MOCK if is_demo else {},
    )

    await update_project(
        req.projectId,
        {
            "confirmed_tools": [t.model_dump() for t in enabled],
            "generated_code": code,
            "status": "generating",
        },
    )

    return GenerateMcpResponse(code=code)
