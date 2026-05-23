"""Phase 3 smoke test — scan a real GitHub repo end-to-end via the Python port."""

from __future__ import annotations

import asyncio
import sys
import time

import httpx

from app.scanner.classify import classify_project
from app.scanner.extract import extract_actions
from app.scanner.filter import (
    MAX_FILES_TO_FETCH,
    MAX_PER_FILE_CHARS,
    SourceFile,
    filter_source_files,
    rank_source_files,
    trim_to_budget,
)
from app.scanner.github import fetch_file, fetch_repo_tree, parse_github_url

TEST_URL = "https://github.com/gothinkster/node-express-realworld-example-app"
CONCURRENCY = 12


async def main() -> int:
    owner, repo = parse_github_url(TEST_URL)
    print(f"=== scanning {owner}/{repo} ===")
    t0 = time.time()

    t = time.time()
    branch, paths = await fetch_repo_tree(owner, repo)
    print(f"tree: {len(paths)} blobs in {time.time() - t:.2f}s on branch '{branch}'")

    classification = classify_project(paths)
    print(f"classified: {classification.type} ({', '.join(classification.signals)})")

    source_paths = rank_source_files(filter_source_files(paths))[:MAX_FILES_TO_FETCH]
    print(f"fetching {len(source_paths)} files (cap {MAX_FILES_TO_FETCH})")

    t = time.time()
    sem = asyncio.Semaphore(CONCURRENCY)
    async with httpx.AsyncClient() as client:

        async def grab(p: str) -> SourceFile:
            async with sem:
                content = await fetch_file(client, owner, repo, branch, p)
            return SourceFile(path=p, content=content)

        results = await asyncio.gather(*(grab(p) for p in source_paths))

    collected = [f for f in results if f.content and len(f.content) <= MAX_PER_FILE_CHARS]
    files = trim_to_budget(collected)
    print(
        f"fetched {len([f for f in results if f.content])} non-empty, kept "
        f"{len(files)} after trim in {time.time() - t:.2f}s"
    )

    t = time.time()
    try:
        actions = await extract_actions(classification.type, files)
    except Exception as e:
        print(f"extract failed: {e}")
        return 1
    print(f"\nextract: {len(actions)} actions in {time.time() - t:.2f}s\n")

    for a in actions[:15]:
        path_part = a.path if a.path is not None else "(null)"
        write = "W" if a.is_write else " "
        auth = "A" if a.requires_auth else " "
        print(f"  {write}{auth}  {a.http_method:6} {path_part:42} {a.name}")

    print(f"\n=== total {time.time() - t0:.1f}s ===")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
