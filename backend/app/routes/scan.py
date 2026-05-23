"""POST /api/scan, POST /api/scan/akaunting-demo, GET /api/scan/{project_id}.

Background scan writes ``current_step`` and ``fetch_progress`` so the
``/scan/[id]`` UI shows real progress.

On failure: ``status='failed'`` + ``error=msg``. ``current_step`` is left at
the failing step so the UI can render the X on the right row.
"""

from __future__ import annotations

import asyncio
import re
import time
from typing import Any

import httpx
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from app.config import settings
from app.db import insert_project, select_project, update_project
from app.demo import (
    AKAUNTING_CLASSIFICATION,
    AKAUNTING_DETECTED_ACTIONS,
    AKAUNTING_SOURCE_URL,
    AKAUNTING_TOOLS,
)
from app.generator.tool_designer import design_tools
from app.models import (
    Classification,
    ScanCreateResponse,
    ScanRequest,
)
from app.scanner.classify import classify_project
from app.scanner.extract import extract_actions
from app.scanner.filter import (
    MAX_FILES_TO_FETCH,
    MAX_PER_FILE_CHARS,
    MAX_TOTAL_CHARS,
    SourceFile,
    filter_source_files,
    rank_source_files,
    trim_to_budget,
)
from app.scanner.github import fetch_file, fetch_repo_tree, parse_github_url

router = APIRouter(tags=["scan"])

_GITHUB_RE = re.compile(r"github\.com", re.IGNORECASE)


@router.post("/scan", response_model=ScanCreateResponse)
async def create_scan(req: ScanRequest, background_tasks: BackgroundTasks) -> ScanCreateResponse:
    source_url = req.sourceUrl.strip()
    if not source_url:
        raise HTTPException(400, "A URL is required")

    is_github = bool(_GITHUB_RE.search(source_url))

    try:
        project = await insert_project({
            "source_url": source_url,
            "source_type": "github" if is_github else "website",
            "status": "scanning",
        })
    except Exception as e:
        raise HTTPException(500, f"Could not create project: {e}") from e

    background_tasks.add_task(_run_scan, project["id"], source_url, is_github)
    return ScanCreateResponse(projectId=project["id"])


@router.post("/scan/akaunting-demo", response_model=ScanCreateResponse)
async def create_akaunting_demo() -> ScanCreateResponse:
    try:
        project = await insert_project({
            "source_url": AKAUNTING_SOURCE_URL,
            "source_type": "akaunting_demo",
            "status": "reviewing",
            "classification": AKAUNTING_CLASSIFICATION.model_dump(),
            "detected_actions": [a.model_dump() for a in AKAUNTING_DETECTED_ACTIONS],
            "proposed_tools": [t.model_dump() for t in AKAUNTING_TOOLS],
            "current_step": "complete",
        })
    except Exception as e:
        raise HTTPException(500, f"Could not start the demo: {e}") from e

    return ScanCreateResponse(projectId=project["id"])


@router.get("/scan/{project_id}")
async def get_scan(project_id: str) -> dict[str, Any]:
    row = await select_project(project_id)
    if row is None:
        raise HTTPException(404, "Not found")
    return row


@router.get("/scan")
async def get_scan_legacy(id: str | None = Query(default=None)) -> dict[str, Any]:
    """Backwards-compatible GET /api/scan?id=... used by the existing frontend.
    Drops once Phase 6 ships."""
    if not id:
        raise HTTPException(400, "id required")
    return await get_scan(id)


# --- background task ---------------------------------------------------------


async def _run_scan(project_id: str, url: str, is_github: bool) -> None:
    t0 = time.time()

    def log(msg: str) -> None:
        print(f"[scan {project_id}] {msg}")

    log(
        f"start url={url} github={is_github} "
        f"github_token={'set' if settings.GITHUB_TOKEN else 'absent'}"
    )

    try:
        classification: Classification
        files: list[SourceFile]

        if is_github:
            await update_project(project_id, {"current_step": "fetching_source"})

            owner, repo = parse_github_url(url)

            t1 = time.time()
            branch, paths = await fetch_repo_tree(owner, repo)
            log(
                f"tree {owner}/{repo}@{branch}: {len(paths)} blobs in "
                f"{(time.time() - t1) * 1000:.0f}ms"
            )

            source_paths = rank_source_files(filter_source_files(paths))[:MAX_FILES_TO_FETCH]
            await update_project(
                project_id,
                {"fetch_progress": {"fetched": 0, "total": len(source_paths)}},
            )
            log(f"fetching {len(source_paths)} source files (cap {MAX_FILES_TO_FETCH})")

            t2 = time.time()
            collected: list[SourceFile] = []
            total_chars = 0
            fetched = 0
            last_reported = 0
            concurrency = 12
            over_budget = False

            async with httpx.AsyncClient() as client:
                for i in range(0, len(source_paths), concurrency):
                    batch = source_paths[i : i + concurrency]

                    async def grab(p: str) -> SourceFile:
                        return SourceFile(
                            path=p,
                            content=await fetch_file(client, owner, repo, branch, p),
                        )

                    results = await asyncio.gather(*(grab(p) for p in batch))

                    for r in results:
                        fetched += 1
                        if not r.content or len(r.content) > MAX_PER_FILE_CHARS:
                            continue
                        collected.append(r)
                        total_chars += len(r.content)
                        if total_chars >= MAX_TOTAL_CHARS:
                            log(
                                f"char budget reached at {len(collected)} files / "
                                f"{total_chars} chars"
                            )
                            over_budget = True
                            break

                    if fetched - last_reported >= 10:
                        await update_project(
                            project_id,
                            {"fetch_progress": {"fetched": fetched, "total": len(source_paths)}},
                        )
                        last_reported = fetched

                    if over_budget:
                        break

            await update_project(
                project_id,
                {"fetch_progress": {"fetched": fetched, "total": len(source_paths)}},
            )
            log(
                f"fetched {len(collected)}/{len(source_paths)} files, "
                f"{total_chars} chars in {(time.time() - t2) * 1000:.0f}ms"
            )

            files = trim_to_budget(collected)

            await update_project(project_id, {"current_step": "classifying"})
            t3 = time.time()
            classification = classify_project(paths)
            await update_project(
                project_id, {"classification": classification.model_dump()}
            )
            log(
                f"classified as {classification.type} in "
                f"{(time.time() - t3) * 1000:.0f}ms"
            )
        else:
            await update_project(
                project_id,
                {
                    "current_step": "fetching_source",
                    "fetch_progress": {"fetched": 0, "total": 1},
                },
            )
            t1 = time.time()
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    url,
                    headers={"User-Agent": "AutoMCP-Scanner/1.0"},
                    timeout=30.0,
                )
            if res.status_code >= 400:
                raise RuntimeError(
                    f"Could not fetch the URL (HTTP {res.status_code})"
                )
            html = res.text[:200_000]
            log(
                f"fetched website html in {(time.time() - t1) * 1000:.0f}ms "
                f"({len(html)} chars)"
            )

            await update_project(
                project_id,
                {
                    "fetch_progress": {"fetched": 1, "total": 1},
                    "current_step": "classifying",
                },
            )
            classification = Classification(
                type="website",
                confidence=0.5,
                signals=["HTML page fetched"],
            )
            await update_project(
                project_id, {"classification": classification.model_dump()}
            )
            files = [SourceFile(path="index.html", content=html)]

        if not files:
            raise RuntimeError("No source files could be read from this URL.")

        await update_project(project_id, {"current_step": "extracting_actions"})
        t4 = time.time()
        actions = await extract_actions(classification.type, files)
        log(
            f"gemini extracted {len(actions)} actions in "
            f"{(time.time() - t4) * 1000:.0f}ms"
        )
        await update_project(
            project_id, {"detected_actions": [a.model_dump() for a in actions]}
        )

        if not actions:
            raise RuntimeError("No user-facing actions were detected in this project.")

        await update_project(project_id, {"current_step": "designing_tools"})
        t5 = time.time()
        tools = await design_tools(actions)
        log(
            f"groq designed {len(tools)} tools in "
            f"{(time.time() - t5) * 1000:.0f}ms"
        )

        await update_project(
            project_id,
            {
                "proposed_tools": [t.model_dump() for t in tools],
                "status": "reviewing",
                "current_step": "complete",
            },
        )
        log(f"done in {(time.time() - t0) * 1000:.0f}ms total")
    except Exception as e:
        message = str(e)
        print(
            f"[scan {project_id}] failed after "
            f"{(time.time() - t0) * 1000:.0f}ms: {message}"
        )
        await update_project(
            project_id,
            {"status": "failed", "error": message},
        )
