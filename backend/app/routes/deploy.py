"""POST /api/deploy — deploy the generated MCP to Cloudflare Workers."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db import select_project, update_project
from app.deployer.cloudflare import deploy_to_workers, is_cloudflare_configured
from app.models import DeployRequest, DeployResponse

router = APIRouter(tags=["deploy"])


@router.post("/deploy", response_model=DeployResponse)
async def deploy(req: DeployRequest) -> DeployResponse:
    project = await select_project(req.projectId)
    if project is None:
        raise HTTPException(404, "Project not found")
    if not project.get("generated_code"):
        raise HTTPException(400, "No MCP code has been generated yet")

    if not is_cloudflare_configured():
        message = (
            "Cloudflare is not configured (CLOUDFLARE_ACCOUNT_ID / "
            "CLOUDFLARE_API_TOKEN / CLOUDFLARE_WORKERS_SUBDOMAIN)."
        )
        await update_project(req.projectId, {"status": "failed", "error": message})
        raise HTTPException(400, message)

    script_name = f"mcp-{str(req.projectId)[:8]}"

    try:
        url = await deploy_to_workers(script_name, project["generated_code"])
    except Exception as e:
        message = str(e)
        print(f"[deploy {req.projectId}] {message}")
        await update_project(req.projectId, {"status": "failed", "error": message})
        raise HTTPException(502, message) from e

    await update_project(req.projectId, {"mcp_url": url, "status": "deployed"})
    return DeployResponse(mcpUrl=url)
