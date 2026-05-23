"""Singleton Supabase client (service-role key — bypasses RLS).

supabase-py 2.x is synchronous; the FastAPI routes wrap calls in
``asyncio.to_thread(...)`` so the event loop stays unblocked.
"""

from __future__ import annotations

from supabase import Client, create_client

from app.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """Lazy singleton. Raises a clear error if env vars are missing."""
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment."
            )
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


def __getattr__(name: str):
    """Allow ``from app.clients.supabase_client import supabase`` while keeping
    initialization lazy."""
    if name == "supabase":
        return get_supabase()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
