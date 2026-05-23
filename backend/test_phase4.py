"""Phase 4 acceptance: one unit test per module (no external services)."""

from __future__ import annotations

import asyncio
import base64
import json
import sys

from app.backend_auth.auth import apply_auth, build_url
from app.generator.code_renderer import render_mcp_server
from app.generator.tool_designer import (
    _normalize_tool,  # type: ignore[reportPrivateUsage]
    canonicalize_type,
)
from app.models import (
    AuthCredentials,
    ConfirmedTool,
    JsonSchema,
    JsonSchemaProperty,
    ProposedTool,
    ToolEndpoint,
)


def test_auth() -> None:
    print("--- backend_auth.auth ---")

    # basic
    h, q = apply_auth(
        "basic",
        AuthCredentials(username="alice", password="s3cret"),
    )
    expected = "Basic " + base64.b64encode(b"alice:s3cret").decode("ascii")
    assert h["Authorization"] == expected, h
    assert q == {}

    # bearer
    h, q = apply_auth("bearer", AuthCredentials(token="tok_abc"))
    assert h == {"Authorization": "Bearer tok_abc"}
    assert q == {}

    # api_key_header default name
    h, q = apply_auth("api_key_header", AuthCredentials(key_value="k"))
    assert h == {"X-API-Key": "k"}
    assert q == {}

    # api_key_header custom name
    h, q = apply_auth(
        "api_key_header",
        AuthCredentials(key_name="Stripe-Signature", key_value="k"),
    )
    assert h == {"Stripe-Signature": "k"}

    # api_key_query default name
    h, q = apply_auth("api_key_query", AuthCredentials(key_value="zzz"))
    assert h == {}
    assert q == {"api_key": "zzz"}

    # none
    assert apply_auth("none", None) == ({}, {})

    # build_url joins safely
    assert build_url("https://x.test/", "/api/v1/items", {"page": "2"}) == (
        "https://x.test/api/v1/items?page=2"
    )
    assert (
        build_url("https://x.test", "api/v1/items") == "https://x.test/api/v1/items"
    )

    print("  ok")


def test_tool_designer_normalization() -> None:
    print("--- generator.tool_designer ---")

    # canonicalize_type happy paths + aliases + unknown passthrough
    assert canonicalize_type("string") == "string"
    assert canonicalize_type("int") == "integer"
    assert canonicalize_type("Int64") == "integer"
    assert canonicalize_type("float") == "number"
    assert canonicalize_type("bool") == "boolean"
    assert canonicalize_type("list") == "array"
    assert canonicalize_type("weird-custom-type") == "weird-custom-type"

    # _normalize_tool rewrites nested types and tolerates messy LLM output
    raw = {
        "name": "create_invoice",
        "description": "Create an invoice",
        "inputSchema": {
            "type": "object",
            "required": ["customer_id"],
            "properties": {
                "customer_id": {"type": "int", "description": "Customer"},
                "items": {
                    "type": "list",
                    "items": {"type": "dict"},
                },
            },
        },
        "writeAction": True,
        "source_action": ["create_invoice"],
    }
    tool = _normalize_tool(raw)
    assert tool.name == "create_invoice"
    assert tool.is_write is True
    props = tool.inputSchema.properties
    assert props["customer_id"].type == "integer"
    assert props["items"].type == "array"
    assert props["items"].items is not None
    assert props["items"].items.type == "object"
    print("  ok")


async def test_code_renderer() -> None:
    print("--- generator.code_renderer ---")

    tools: list[ProposedTool | ConfirmedTool] = [
        ConfirmedTool(
            name="list_things",
            description="List the things.",
            inputSchema=JsonSchema(
                type="object",
                properties={
                    "limit": JsonSchemaProperty(
                        type="integer", description="Max items"
                    )
                },
                required=[],
            ),
            is_write=False,
            source_action=["list_things"],
            enabled=True,
        ),
    ]

    code = await render_mcp_server(
        source_url="https://github.com/example/thing",
        server_name="mcp-test1234",
        tools=tools,
        api_base="https://api.example.com",
        auth_type="bearer",
        auth_credentials=AuthCredentials(token="tok_xyz"),
        tool_endpoints={
            "list_things": ToolEndpoint(
                path="/api/v1/things",
                method="GET",
                content_type="application/json",
                requires_auth=True,
            ),
        },
        mock={},
    )

    # Structural assertions on the rendered Worker source.
    assert "const SERVER_NAME = " in code
    assert '"mcp-test1234"' in code
    assert '"https://github.com/example/thing"' in code
    assert '"https://api.example.com"' in code
    assert '"bearer"' in code
    assert '"tok_xyz"' in code
    assert '"list_things"' in code
    assert '"/api/v1/things"' in code
    assert "export default {" in code

    # The injected JSON literals must themselves be valid JSON.
    # Pull them back out by splitting on the const declarations.
    for marker in ("const TOOLS = ", "const TOOL_ENDPOINTS = ", "const AUTH = ", "const MOCK = "):
        i = code.find(marker)
        assert i != -1, f"missing marker: {marker}"
        # Snippet from `=` to next semicolon-newline
        start = code.find("=", i) + 1
        end = code.find(";\n", start)
        chunk = code[start:end].strip()
        json.loads(chunk)  # raises if invalid

    print(f"  ok ({len(code)} chars rendered)")


async def test_cloudflare_guard() -> None:
    """Without testing actual deploy (side-effectful), verify the guard
    rejects missing config."""
    print("--- deployer.cloudflare ---")
    import importlib

    from app import config as config_module

    orig = (
        config_module.settings.CLOUDFLARE_ACCOUNT_ID,
        config_module.settings.CLOUDFLARE_API_TOKEN,
        config_module.settings.CLOUDFLARE_WORKERS_SUBDOMAIN,
    )
    try:
        config_module.settings.CLOUDFLARE_ACCOUNT_ID = ""
        config_module.settings.CLOUDFLARE_API_TOKEN = ""
        config_module.settings.CLOUDFLARE_WORKERS_SUBDOMAIN = ""

        from app.deployer import cloudflare as cf

        importlib.reload(cf)
        assert cf.is_cloudflare_configured() is False
        try:
            await cf.deploy_to_workers("mcp-test", "// stub")
        except RuntimeError as e:
            assert "not configured" in str(e), e
        else:
            raise AssertionError("expected RuntimeError when CF env is missing")
    finally:
        (
            config_module.settings.CLOUDFLARE_ACCOUNT_ID,
            config_module.settings.CLOUDFLARE_API_TOKEN,
            config_module.settings.CLOUDFLARE_WORKERS_SUBDOMAIN,
        ) = orig
        from app.deployer import cloudflare as cf

        importlib.reload(cf)

    print("  ok")


async def main() -> int:
    failures: list[str] = []
    for label, fn in [
        ("auth", test_auth),
        ("tool_designer", test_tool_designer_normalization),
    ]:
        try:
            fn()  # type: ignore[no-untyped-call]
        except Exception as e:
            failures.append(f"{label}: {type(e).__name__}: {e}")
            print(f"  FAILED: {type(e).__name__}: {e}")

    for label, afn in [
        ("code_renderer", test_code_renderer),
        ("cloudflare", test_cloudflare_guard),
    ]:
        try:
            await afn()
        except Exception as e:
            failures.append(f"{label}: {type(e).__name__}: {e}")
            print(f"  FAILED: {type(e).__name__}: {e}")

    print()
    if failures:
        print(f"=== {len(failures)} failure(s) ===")
        for f in failures:
            print(f"  {f}")
        return 1
    print("=== all OK ===")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
