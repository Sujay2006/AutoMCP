"""Read knowledge_base_with_embeddings.jsonl and insert rows into mcp_knowledge_base.

Run from the backend/ directory (with .env populated):
    .venv/Scripts/python -m scripts.load_to_supabase

Idempotent: clears the table first, then inserts. If you want to keep existing
rows, comment out the `delete` call below.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

from app.clients.supabase_client import get_supabase

_RAG_DIR = Path(__file__).resolve().parents[1] / "app" / "rag"
INPUT_PATH = _RAG_DIR / "knowledge_base_with_embeddings.jsonl"
BATCH_SIZE = 50


def main() -> None:
    if not INPUT_PATH.exists():
        raise SystemExit(
            f"missing {INPUT_PATH} — run `python -m scripts.build_embeddings` first"
        )

    rows: list[dict] = []
    with INPUT_PATH.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                t = json.loads(line)
            except json.JSONDecodeError as e:
                raise SystemExit(f"line {line_no}: {e}") from e
            rows.append({
                "tool_name": t["tool_name"],
                "description": t["description"],
                "category": t.get("category"),
                "input_schema": t.get("input_schema"),
                "source_mcp": t.get("source_mcp"),
                "embedding": t["embedding"],
            })

    sb = get_supabase()
    print(f"clearing existing rows in mcp_knowledge_base…")
    sb.table("mcp_knowledge_base").delete().gte("id", 0).execute()

    print(f"inserting {len(rows)} rows…")
    t0 = time.time()
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        res = sb.table("mcp_knowledge_base").insert(batch).execute()
        if not res.data:
            print(f"  WARN batch {i // BATCH_SIZE} returned no data", file=sys.stderr)
        print(f"  inserted {min(i + BATCH_SIZE, len(rows))}/{len(rows)}")

    print(f"done in {(time.time() - t0):.1f}s")


if __name__ == "__main__":
    main()
