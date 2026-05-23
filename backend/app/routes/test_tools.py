"""POST /api/test-tools — dry-run each enabled tool against the user's backend."""

from __future__ import annotations

import datetime as _dt
import re

import httpx
from fastapi import APIRouter, HTTPException

from app.backend_auth.auth import apply_auth, build_url
from app.db import select_project, update_project
from app.models import (
    BackendConfig,
    ConfirmedTool,
    TestToolsRequest,
    TestToolsResponse,
    ToolEndpoint,
    ToolTestResult,
)

router = APIRouter(tags=["test-tools"])

_PARAM_RE = re.compile(r":[A-Za-z_]\w*|\{[A-Za-z_]\w*\}")


def _substitute_params(path: str) -> str:
    """Replace :foo and {foo} placeholders with '1' so the probe URL is concrete."""
    return _PARAM_RE.sub("1", path)


async def _probe(
    client: httpx.AsyncClient,
    backend: BackendConfig,
    endpoint: ToolEndpoint | None,
) -> ToolTestResult:
    now = _dt.datetime.now(tz=_dt.timezone.utc).isoformat()

    if endpoint is None or not endpoint.path.strip():
        return ToolTestResult(
            **{"pass": False}, error="No endpoint path configured", tested_at=now
        )

    try:
        headers, query = apply_auth(backend.auth_type, backend.auth_credentials)
        url = build_url(backend.api_base, _substitute_params(endpoint.path), query)
    except Exception as e:
        return ToolTestResult(
            **{"pass": False}, error=f"Invalid URL: {e}", tested_at=now
        )

    method = (endpoint.method or "GET").upper()

    try:
        if method == "GET":
            res = await client.get(url, headers=headers, timeout=10.0)
        else:
            # Probe ladder for write methods: OPTIONS → HEAD → GET
            res = await client.options(url, headers=headers, timeout=10.0)
            if res.status_code in (405, 501):
                res = await client.head(url, headers=headers, timeout=10.0)
            if res.status_code in (405, 501):
                res = await client.get(url, headers=headers, timeout=10.0)
    except httpx.TimeoutException:
        return ToolTestResult(
            **{"pass": False}, error="Probe timed out after 10s", tested_at=now
        )
    except httpx.HTTPError as e:
        return ToolTestResult(**{"pass": False}, error=str(e), tested_at=now)

    status = res.status_code
    snippet = (res.text or "")[:200] if res.text else None

    if 200 <= status < 400:
        return ToolTestResult(
            **{"pass": True}, status=status, snippet=snippet, tested_at=now
        )
    if status in (401, 403):
        return ToolTestResult(
            **{"pass": True}, status=status, snippet=snippet, tested_at=now
        )
    if status == 404:
        return ToolTestResult(
            **{"pass": False},
            status=status,
            snippet=snippet,
            error="Endpoint not found at this path",
            tested_at=now,
        )
    if status == 405:
        return ToolTestResult(
            **{"pass": True}, status=status, snippet=snippet, tested_at=now
        )
    if 400 <= status < 500:
        return ToolTestResult(
            **{"pass": True}, status=status, snippet=snippet, tested_at=now
        )
    return ToolTestResult(
        **{"pass": False},
        status=status,
        snippet=snippet,
        error=f"Server error {status}",
        tested_at=now,
    )


@router.post("/test-tools", response_model=TestToolsResponse)
async def test_tools(req: TestToolsRequest) -> TestToolsResponse:
    project = await select_project(req.projectId)
    if project is None:
        raise HTTPException(404, "Project not found")

    backend_raw = project.get("backend_config")
    if not backend_raw:
        raise HTTPException(
            400, f"Connect a backend first (/connect/{req.projectId})"
        )
    backend = BackendConfig.model_validate(backend_raw)
    backend = backend.model_copy(update={"tool_endpoints": req.toolEndpoints})

    confirmed_raw = project.get("confirmed_tools") or []
    confirmed = [ConfirmedTool.model_validate(t) for t in confirmed_raw]
    enabled = [t for t in confirmed if t.enabled]

    results: dict[str, ToolTestResult] = {}
    async with httpx.AsyncClient(follow_redirects=False) as client:
        for tool in enabled:
            ep = req.toolEndpoints.get(tool.name)
            results[tool.name] = await _probe(client, backend, ep)

    await update_project(
        req.projectId,
        {
            "backend_config": backend.model_dump(),
            "tool_test_results": {
                k: v.model_dump(by_alias=True) for k, v in results.items()
            },
        },
    )

    return TestToolsResponse(results=results)
