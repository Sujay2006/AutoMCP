"""Phase 2 smoke test: call each client wrapper once and verify it works.

Usage (from the backend/ directory with .env populated):
    .venv/Scripts/python test_clients.py
"""

from __future__ import annotations

import asyncio
import sys
import time

from app.clients.gemini import call_gemini
from app.clients.groq import call_groq
from app.clients.supabase_client import get_supabase


async def test_gemini() -> None:
    print("--- gemini ---")
    t = time.time()
    result = await call_gemini(
        system_prompt="Reply with valid JSON only. No prose.",
        user_prompt='Return a JSON object with key "greeting" set to the string "hello from gemini".',
    )
    dt = (time.time() - t) * 1000
    print(f"  ({dt:.0f}ms) {result!r}")
    assert isinstance(result, dict) and "greeting" in result, "missing greeting key"


async def test_groq() -> None:
    print("--- groq ---")
    t = time.time()
    result = await call_groq(
        system_prompt="Reply with valid JSON only. No prose.",
        user_prompt='Return a JSON object with key "greeting" set to the string "hello from groq".',
    )
    dt = (time.time() - t) * 1000
    print(f"  ({dt:.0f}ms) {result!r}")
    assert isinstance(result, dict) and "greeting" in result, "missing greeting key"


def test_supabase() -> None:
    print("--- supabase ---")
    t = time.time()
    sb = get_supabase()
    res = sb.table("projects").select("id, source_url, status").limit(1).execute()
    dt = (time.time() - t) * 1000
    print(f"  ({dt:.0f}ms) {len(res.data)} row(s); first: {res.data[0] if res.data else None}")


async def main() -> int:
    failures: list[str] = []
    for label, fn in (("gemini", test_gemini), ("groq", test_groq)):
        try:
            await fn()
        except Exception as e:
            failures.append(f"{label}: {e}")
            print(f"  FAILED: {e}")
    try:
        test_supabase()
    except Exception as e:
        failures.append(f"supabase: {e}")
        print(f"  FAILED: {e}")
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
