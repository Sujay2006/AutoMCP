"""POST /api/generate-tools, POST /api/confirmed-tools."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db import select_project, update_project
from app.generator.tool_designer import design_tools
from app.models import (
    ConfirmedToolsRequest,
    DetectedAction,
    GenerateToolsRequest,
    GenerateToolsResponse,
    OkResponse,
)

router = APIRouter(tags=["tools"])


@router.post("/generate-tools", response_model=GenerateToolsResponse)
async def generate_tools(req: GenerateToolsRequest) -> GenerateToolsResponse:
    project = await select_project(req.projectId)
    if project is None:
        raise HTTPException(404, "Project not found")

    actions_raw = project.get("detected_actions") or []
    if not actions_raw:
        raise HTTPException(400, "No detected actions to design tools from")

    actions = [DetectedAction.model_validate(a) for a in actions_raw]
    tools = await design_tools(actions)

    await update_project(
        req.projectId,
        {
            "proposed_tools": [t.model_dump() for t in tools],
            "status": "reviewing",
        },
    )
    return GenerateToolsResponse(tools=tools)


@router.post("/confirmed-tools", response_model=OkResponse)
async def save_confirmed_tools(req: ConfirmedToolsRequest) -> OkResponse:
    await update_project(
        req.projectId,
        {"confirmed_tools": [t.model_dump() for t in req.confirmedTools]},
    )
    return OkResponse()
