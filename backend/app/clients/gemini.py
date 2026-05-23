"""Gemini 2.5 Flash client wrapper — port of automcp/lib/gemini.ts.

The google-genai SDK exposes a sync client. We wrap each call in
``asyncio.to_thread`` to keep FastAPI handlers non-blocking.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

from google import genai
from google.genai import types

from app.config import settings

GEMINI_MODEL = "gemini-2.5-flash"

# Big repos easily produce >8K tokens of structured output (lib/gemini.ts
# learned this the hard way). Gemini 2.5 Flash supports up to 65K — give room.
DEFAULT_MAX_OUTPUT_TOKENS = 32_768

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def call_gemini(
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
) -> Any:
    """Call Gemini with native JSON mode and return parsed JSON.

    Raises a RuntimeError if the response was truncated (``finish_reason ==
    MAX_TOKENS``) so callers don't try to parse a partial response.
    """

    def _run_sync() -> tuple[str, Any]:
        client = _get_client()

        config_kwargs: dict[str, Any] = {
            "system_instruction": system_prompt,
            "response_mime_type": "application/json",
            "temperature": 0.2,
            "max_output_tokens": DEFAULT_MAX_OUTPUT_TOKENS,
        }
        if response_schema is not None:
            config_kwargs["response_schema"] = response_schema

        config = types.GenerateContentConfig(**config_kwargs)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=user_prompt,
            config=config,
        )

        finish_reason = None
        if response.candidates:
            finish_reason = getattr(response.candidates[0], "finish_reason", None)
        return response.text or "", finish_reason

    text, finish_reason = await asyncio.to_thread(_run_sync)

    # finish_reason is an enum-ish object in newer SDKs; normalize to string.
    if finish_reason is not None and "MAX_TOKENS" in str(finish_reason):
        raise RuntimeError(
            "Gemini's output was truncated — the project has too many endpoints "
            "to fit in one response. Try a smaller repository."
        )

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Gemini returned non-JSON output: {text[:200]}"
        ) from e
