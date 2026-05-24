"""Read knowledge_base.jsonl, embed every tool, write knowledge_base_with_embeddings.jsonl.

Run from the backend/ directory:
    .venv/Scripts/python -m scripts.build_embeddings
"""

from __future__ import annotations

import json
import time
from pathlib import Path

from app.rag.embedder import embed_tool

_RAG_DIR = Path(__file__).resolve().parents[1] / "app" / "rag"
INPUT_PATH = _RAG_DIR / "knowledge_base.jsonl"
OUTPUT_PATH = _RAG_DIR / "knowledge_base_with_embeddings.jsonl"


def main() -> None:
    if not INPUT_PATH.exists():
        raise SystemExit(f"missing {INPUT_PATH}")

    tools: list[dict] = []
    with INPUT_PATH.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                tools.append(json.loads(line))
            except json.JSONDecodeError as e:
                raise SystemExit(f"line {line_no}: {e}") from e

    print(f"embedding {len(tools)} tools…")
    t0 = time.time()
    with OUTPUT_PATH.open("w", encoding="utf-8") as out:
        for i, tool in enumerate(tools, start=1):
            tool["embedding"] = embed_tool(tool)
            out.write(json.dumps(tool) + "\n")
            if i % 25 == 0:
                print(f"  {i}/{len(tools)} ({(time.time() - t0):.1f}s elapsed)")

    print(f"wrote {OUTPUT_PATH} ({(time.time() - t0):.1f}s)")


if __name__ == "__main__":
    main()
