"""User-backend auth helper — port of automcp/lib/backend/auth.ts.

Same four schemes (basic, bearer, api_key_header, api_key_query) plus 'none'.
Every server-side call to a user-configured backend goes through this so the
schemes behave identically across test-connection, test-tools, and the
generated Worker.
"""

from __future__ import annotations

import base64
from typing import Any
from urllib.parse import urlencode

from app.models import AuthCredentials, AuthType


def apply_auth(
    auth_type: AuthType,
    creds: AuthCredentials | dict[str, Any] | None,
) -> tuple[dict[str, str], dict[str, str]]:
    """Return (headers, query_params) for the configured auth scheme."""
    if creds is None:
        c: dict[str, Any] = {}
    elif isinstance(creds, AuthCredentials):
        c = creds.model_dump(exclude_none=True)
    else:
        c = creds

    headers: dict[str, str] = {}
    query: dict[str, str] = {}

    if auth_type == "basic":
        u = str(c.get("username") or "")
        p = str(c.get("password") or "")
        encoded = base64.b64encode(f"{u}:{p}".encode("utf-8")).decode("ascii")
        headers["Authorization"] = f"Basic {encoded}"
    elif auth_type == "bearer":
        headers["Authorization"] = f"Bearer {c.get('token') or ''}"
    elif auth_type == "api_key_header":
        name = str(c.get("key_name") or "").strip() or "X-API-Key"
        headers[name] = str(c.get("key_value") or "")
    elif auth_type == "api_key_query":
        name = str(c.get("key_name") or "").strip() or "api_key"
        query[name] = str(c.get("key_value") or "")
    # "none" falls through with both empty.

    return headers, query


def build_url(
    api_base: str,
    path: str,
    query_params: dict[str, str] | None = None,
) -> str:
    """Resolve a path against an API base and append optional query params."""
    base = api_base.rstrip("/")
    p = path if path.startswith("/") else f"/{path}"
    url = f"{base}{p}"
    if query_params:
        url += "?" + urlencode(query_params)
    return url
