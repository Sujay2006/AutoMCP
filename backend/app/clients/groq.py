"""Groq (Llama 3.3 70B) client wrapper — port of automcp/lib/groq.ts.

Uses ``AsyncGroq`` directly so we don't need a thread offload.
"""

from __future__ import annotations

import json
from typing import Any

from groq import AsyncGroq

from app.config import settings

GROQ_MODEL = "llama-3.3-70b-versatile"

_client: AsyncGroq | None = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set")
        _client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _client


async def call_groq(system_prompt: str, user_prompt: str) -> Any:
    """Call Groq with JSON mode and return parsed JSON."""
    client = _get_client()
    response = await client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=4096,
    )
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("Empty response from Groq")
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Groq returned non-JSON output: {content[:200]}"
        ) from e
