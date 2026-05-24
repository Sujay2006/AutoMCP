"""Cosine-similarity retrieval against mcp_knowledge_base in Supabase pgvector.

Used by the tool designer to inject few-shot examples into the Groq prompt.
Tracks recent retrieval similarities in-process so /api/rag/stats can surface
them for the demo.
"""

from __future__ import annotations

import asyncio
from collections import deque
from typing import Any

from app.clients.supabase_client import get_supabase
from app.rag.embedder import embed_text

# Rolling buffer of average-top-k similarity from each retrieve call.
# Used only by /api/rag/stats — not load-bearing for correctness.
_RECENT_SIMILARITIES: deque[float] = deque(maxlen=10)


async def retrieve_similar_tools(
    query_text: str,
    k: int = 5,
) -> list[dict[str, Any]]:
    """Embed `query_text` and return the k most similar tools from the KB.

    Each result has: tool_name, description, category, input_schema, source_mcp,
    similarity (0-1, higher is closer).

    Returns [] and logs (not raises) if Supabase is unreachable or pgvector
    isn't installed — the tool designer can still proceed without RAG.
    """
    query_embedding = await asyncio.to_thread(embed_text, query_text)

    def _do() -> list[dict[str, Any]]:
        sb = get_supabase()
        res = sb.rpc(
            "match_tools",
            {"query_embedding": query_embedding, "match_count": k},
        ).execute()
        return list(res.data or [])

    try:
        results = await asyncio.to_thread(_do)
    except Exception as e:
        print(f"[rag] retrieve failed (continuing without RAG): {e}")
        return []

    if results:
        avg = sum(r.get("similarity", 0.0) for r in results) / len(results)
        _RECENT_SIMILARITIES.append(avg)

    return results


def recent_similarity_stats() -> dict[str, Any]:
    """Snapshot of the rolling similarity buffer for /api/rag/stats."""
    if not _RECENT_SIMILARITIES:
        return {"count": 0, "average": None}
    return {
        "count": len(_RECENT_SIMILARITIES),
        "average": sum(_RECENT_SIMILARITIES) / len(_RECENT_SIMILARITIES),
    }
