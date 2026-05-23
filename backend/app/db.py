"""Thin async helpers around the (sync) Supabase client.

Routes use these so the sync supabase-py calls never block the event loop.
"""

from __future__ import annotations

import asyncio
from typing import Any

from app.clients.supabase_client import get_supabase
from app.models import ProjectRecord


def _sb():
    return get_supabase()


async def select_project(project_id: str) -> dict[str, Any] | None:
    def _do():
        return (
            _sb().table("projects").select("*").eq("id", project_id).limit(1).execute()
        )

    res = await asyncio.to_thread(_do)
    return res.data[0] if res.data else None


async def select_project_typed(project_id: str) -> ProjectRecord | None:
    row = await select_project(project_id)
    if row is None:
        return None
    return ProjectRecord.model_validate(row)


async def insert_project(payload: dict[str, Any]) -> dict[str, Any]:
    def _do():
        return _sb().table("projects").insert(payload).execute()

    res = await asyncio.to_thread(_do)
    if not res.data:
        raise RuntimeError("insert returned no data")
    return res.data[0]


async def update_project(project_id: str, patch: dict[str, Any]) -> None:
    def _do():
        return _sb().table("projects").update(patch).eq("id", project_id).execute()

    await asyncio.to_thread(_do)
