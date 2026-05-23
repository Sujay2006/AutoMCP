"""POST /api/test-connection — verify a user-supplied backend URL + auth."""

from __future__ import annotations

import httpx
from fastapi import APIRouter
from urllib.parse import urlparse

from app.backend_auth.auth import apply_auth, build_url
from app.db import select_project, update_project
from app.models import (
    BackendConfig,
    TestConnectionRequest,
    TestConnectionResponse,
)

router = APIRouter(tags=["connection"])


@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(req: TestConnectionRequest) -> TestConnectionResponse:
    api_base = req.apiBase.strip()
    if not api_base:
        return TestConnectionResponse(ok=False, error="API base URL is required.")

    parsed = urlparse(api_base)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return TestConnectionResponse(
            ok=False,
            error="API base must be a full http:// or https:// URL.",
        )

    try:
        headers, query = apply_auth(req.authType, req.credentials)
        probe_url = build_url(api_base, "/", query)
    except Exception as e:
        return TestConnectionResponse(ok=False, error=f"Bad request: {e}")

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=False) as client:
            res = await client.get(probe_url, headers=headers)
    except httpx.TimeoutException:
        return TestConnectionResponse(
            ok=False,
            error="Connection timed out after 15s — is the URL reachable from this server?",
        )
    except httpx.HTTPError as e:
        return TestConnectionResponse(ok=False, error=str(e))

    www_auth = res.headers.get("www-authenticate")
    in_4xx = 400 <= res.status_code < 500
    ok = (
        200 <= res.status_code < 300
        or 300 <= res.status_code < 400
        or (in_4xx and www_auth is not None)
    )

    if not ok:
        snippet = (res.text or "")[:400].strip()
        return TestConnectionResponse(
            ok=False,
            status=res.status_code,
            error=f"HTTP {res.status_code}{' — ' + snippet if snippet else ''}",
        )

    # Save backend_config, preserving any tool_endpoints already saved.
    project = await select_project(req.projectId)
    prior_endpoints = (
        (project.get("backend_config") or {}).get("tool_endpoints") if project else None
    ) or {}

    merged = BackendConfig(
        api_base=api_base.rstrip("/"),
        auth_type=req.authType,
        auth_credentials=req.credentials,
        tool_endpoints=prior_endpoints if isinstance(prior_endpoints, dict) else {},
    )
    await update_project(req.projectId, {"backend_config": merged.model_dump()})

    return TestConnectionResponse(ok=True, status=res.status_code)
