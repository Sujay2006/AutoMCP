"""POST /api/generate-mcp — render the deployable Worker code.

Gates: refuses unless source_type=='akaunting_demo' OR (backend_config is set
AND every enabled tool has a passing tool_test_result).
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db import select_project, update_project
from app.demo import AKAUNTING_MOCK
from app.generator.code_renderer import render_mcp_server
from app.models import (
    AuthCredentials,
    BackendConfig,
    ConfirmedTool,
    GenerateMcpRequest,
    GenerateMcpResponse,
)

router = APIRouter(tags=["generate"])


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

    if not is_demo:
        if not project.get("backend_config"):
            raise HTTPException(
                400, f"Connect a backend first: /connect/{req.projectId}"
            )
        results = project.get("tool_test_results") or {}
        failing = [
            t
            for t in enabled
            if not (results.get(t.name) or {}).get("pass")
        ]
        if failing:
            names = ", ".join(t.name for t in failing)
            raise HTTPException(
                400,
                f"{len(failing)} tool(s) haven't passed testing yet: {names}. "
                f"Visit /map/{req.projectId} to test them.",
            )

    server_name = f"mcp-{str(req.projectId)[:8]}"
    backend_raw = project.get("backend_config")
    backend = BackendConfig.model_validate(backend_raw) if backend_raw else None

    code = await render_mcp_server(
        source_url=project["source_url"],
        server_name=server_name,
        tools=list(enabled),
        api_base=backend.api_base if backend else None,
        auth_type=backend.auth_type if backend else "none",
        auth_credentials=backend.auth_credentials if backend else AuthCredentials(),
        tool_endpoints=backend.tool_endpoints if backend else {},
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
