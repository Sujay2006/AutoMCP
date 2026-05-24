"""GET /api/rag/stats — knowledge-base + retrieval metrics for the demo UI.

Surfaces three numbers:
  - total tools in the curated MCP knowledge base
  - categories covered
  - rolling-average similarity of the last N retrieval calls

Used by the success page to render a "RAG matched N tools" badge so judges
can see retrieval is real, not just hand-waving.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter

from app.clients.supabase_client import get_supabase
from app.rag.retriever import recent_similarity_stats

router = APIRouter(tags=["rag"], prefix="/rag")


@router.get("/stats")
async def rag_stats() -> dict[str, Any]:
    def _do() -> dict[str, Any]:
        sb = get_supabase()
        res = (
            sb.table("mcp_knowledge_base")
            .select("category", count="exact")
            .execute()
        )
        rows = res.data or []
        total = res.count if res.count is not None else len(rows)
        categories = sorted({r["category"] for r in rows if r.get("category")})
        return {"total_tools": total, "categories": categories}

    try:
        kb = await asyncio.to_thread(_do)
    except Exception as e:
        # Knowledge base not loaded yet (or pgvector schema not applied) —
        # return a soft "not ready" response instead of a 500 so the UI can
        # gracefully omit the badge.
        return {
            "ready": False,
            "error": str(e),
            "total_tools": 0,
            "categories": [],
            "recent_retrievals": {"count": 0, "average": None},
        }

    return {
        "ready": True,
        "total_tools": kb["total_tools"],
        "categories": kb["categories"],
        "category_count": len(kb["categories"]),
        "recent_retrievals": recent_similarity_stats(),
    }
