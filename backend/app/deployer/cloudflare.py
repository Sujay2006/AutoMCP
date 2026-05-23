"""Cloudflare Workers deployer — port of automcp/lib/deployer/cloudflare.ts.

Uploads the rendered Worker via the multipart-modules endpoint and enables the
workers.dev subdomain route for the script. Returns the public Worker URL.
"""

from __future__ import annotations

import json

import httpx

from app.config import settings

CF_API = "https://api.cloudflare.com/client/v4"


def is_cloudflare_configured() -> bool:
    return bool(
        settings.CLOUDFLARE_ACCOUNT_ID
        and settings.CLOUDFLARE_API_TOKEN
        and settings.CLOUDFLARE_WORKERS_SUBDOMAIN
    )


async def deploy_to_workers(script_name: str, code: str) -> str:
    """Upload the worker script and enable its workers.dev route.

    Returns the public MCP URL (https://<script>.<subdomain>.workers.dev).
    """
    account_id = settings.CLOUDFLARE_ACCOUNT_ID
    api_token = settings.CLOUDFLARE_API_TOKEN
    subdomain = settings.CLOUDFLARE_WORKERS_SUBDOMAIN

    if not (account_id and api_token and subdomain):
        raise RuntimeError(
            "Cloudflare is not configured (CLOUDFLARE_ACCOUNT_ID / "
            "CLOUDFLARE_API_TOKEN / CLOUDFLARE_WORKERS_SUBDOMAIN)."
        )

    metadata = {"main_module": "worker.js", "compatibility_date": "2024-09-01"}

    # httpx's `files` arg builds multipart/form-data; field values are
    # (filename, content, content_type) tuples. Filename=None means a
    # multipart part with no filename, which is what Cloudflare wants for the
    # metadata blob.
    files = {
        "metadata": (None, json.dumps(metadata), "application/json"),
        "worker.js": (
            "worker.js",
            code.encode("utf-8"),
            "application/javascript+module",
        ),
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        upload = await client.put(
            f"{CF_API}/accounts/{account_id}/workers/scripts/{script_name}",
            headers={"Authorization": f"Bearer {api_token}"},
            files=files,
        )
        if upload.status_code >= 400:
            raise RuntimeError(
                f"Cloudflare upload failed ({upload.status_code}): {upload.text}"
            )

        # Enable workers.dev route. Non-fatal if it 4xxs (often already enabled).
        sub_res = await client.post(
            f"{CF_API}/accounts/{account_id}/workers/scripts/{script_name}/subdomain",
            headers={
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
            },
            json={"enabled": True},
        )
        if sub_res.status_code >= 400:
            print(
                f"[cloudflare] enabling subdomain returned "
                f"{sub_res.status_code}: {sub_res.text}"
            )

    return f"https://{script_name}.{subdomain}.workers.dev"
