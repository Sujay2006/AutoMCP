"""GitHub fetch helpers — port of automcp/lib/scanner/github.ts.

PyGithub handles repo metadata (1-2 REST calls per scan, well under the
unauthenticated 60/hour limit). File contents come from raw.githubusercontent.com
via httpx — the CDN doesn't share the REST API rate budget, so big scans work
even without GITHUB_TOKEN set. When the token IS set, we send it on both paths.

Backoff + logging matches automcp/lib/scanner/github.ts so slow scans can be
profiled from the function logs.
"""

from __future__ import annotations

import asyncio
import re
from urllib.parse import quote

import httpx
from github import Auth, Github

from app.config import settings

GITHUB_RAW_BASE = "https://raw.githubusercontent.com"
RAW_TIMEOUT_S = 10.0
RAW_MAX_ATTEMPTS = 4


def _make_github() -> Github:
    if settings.GITHUB_TOKEN:
        return Github(auth=Auth.Token(settings.GITHUB_TOKEN))
    return Github()


def parse_github_url(url: str) -> tuple[str, str]:
    m = re.search(r"github\.com/([^/\s]+)/([^/?#\s]+)", url, re.IGNORECASE)
    if not m:
        raise ValueError("Not a valid GitHub URL")
    owner = m.group(1)
    repo = re.sub(r"\.git$", "", m.group(2))
    return owner, repo


def _fetch_tree_sync(owner: str, repo_name: str) -> tuple[str, list[str]]:
    """Sync helper — wraps PyGithub. Called via asyncio.to_thread."""
    gh = _make_github()
    try:
        repo = gh.get_repo(f"{owner}/{repo_name}")
        branch = repo.default_branch
        tree = repo.get_git_tree(branch, recursive=True)
        paths = [t.path for t in tree.tree if t.type == "blob"]
        return branch, paths
    finally:
        gh.close()


async def fetch_repo_tree(owner: str, repo: str) -> tuple[str, list[str]]:
    """Return (default_branch, list_of_blob_paths) for the given repo."""
    return await asyncio.to_thread(_fetch_tree_sync, owner, repo)


def _build_raw_url(owner: str, repo: str, branch: str, file_path: str) -> str:
    encoded = "/".join(quote(part, safe="") for part in file_path.split("/"))
    return f"{GITHUB_RAW_BASE}/{owner}/{repo}/{branch}/{encoded}"


async def fetch_file(
    client: httpx.AsyncClient,
    owner: str,
    repo: str,
    branch: str,
    file_path: str,
) -> str:
    """Fetch raw file content with per-request timeout and exponential backoff
    on 429 / 403 / 5xx. Returns "" for permanent failures so the caller keeps
    going. Logs each retry."""
    url = _build_raw_url(owner, repo, branch, file_path)
    headers = (
        {"Authorization": f"token {settings.GITHUB_TOKEN}"}
        if settings.GITHUB_TOKEN
        else {}
    )

    last_err: Exception | None = None
    for attempt in range(RAW_MAX_ATTEMPTS):
        try:
            res = await client.get(url, headers=headers, timeout=RAW_TIMEOUT_S)

            if res.status_code == 200:
                return res.text
            if res.status_code == 404:
                return ""
            if res.status_code in (429, 403) or res.status_code >= 500:
                retry_after = res.headers.get("retry-after")
                backoff_s = (
                    float(retry_after)
                    if retry_after
                    else min(8.0, 0.4 * (2**attempt))
                )
                print(
                    f"[github-cdn] {res.status_code} {file_path} attempt "
                    f"{attempt + 1}; backing off {backoff_s:.1f}s"
                )
                last_err = RuntimeError(f"HTTP {res.status_code}")
                await asyncio.sleep(backoff_s)
                continue
            # Other 4xx: not worth retrying, but don't blow up the scan.
            return ""
        except (httpx.TimeoutException, httpx.HTTPError) as e:
            last_err = e
            backoff_s = min(8.0, 0.4 * (2**attempt))
            print(
                f"[github-cdn] error {file_path} attempt {attempt + 1}: "
                f"{e}; backing off {backoff_s:.1f}s"
            )
            await asyncio.sleep(backoff_s)

    print(f"[github-cdn] giving up on {file_path}: {last_err}")
    return ""
