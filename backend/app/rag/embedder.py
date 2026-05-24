"""Embedding pipeline using sentence-transformers.

Uses all-MiniLM-L6-v2 (384-dim, ~80MB model). Loads lazily and caches the
singleton because instantiating the model is slow (~2-3s) and we only need
one per process.
"""

from __future__ import annotations

from typing import Any

from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """Lazy singleton — first call downloads the model (~80MB) and caches it."""
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_text(text: str) -> list[float]:
    """Embed an arbitrary string into a 384-dim vector."""
    if not text or not text.strip():
        text = " "
    vec = get_model().encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return vec.tolist()


def embed_tool(tool: dict[str, Any]) -> list[float]:
    """Embed a tool dict by concatenating its semantic fields.

    Combines name + description + category so semantic similarity captures
    both what the tool is called and what it does in which domain.
    """
    name = str(tool.get("tool_name") or tool.get("name") or "")
    description = str(tool.get("description") or "")
    category = str(tool.get("category") or "")
    combined = f"{name}. {description}. Category: {category}.".strip()
    return embed_text(combined)
