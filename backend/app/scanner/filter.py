"""Source-file filter + budget trimmer — port of automcp/lib/scanner/filter.ts.

Same constants as the TS version so both backends behave identically:
  - ~200K input tokens fits Gemini 2.5 Flash's free-tier per-minute cap
  - 500-file pre-fetch cap prevents OOM on enormous repos
"""

from __future__ import annotations

import re
from typing import NamedTuple

EXCLUDE_DIRS: frozenset[str] = frozenset({
    "node_modules", "vendor", ".git", "dist", "build", ".next", "out",
    "storage", "bootstrap/cache", "public/uploads", "public/storage",
    "tests", "test", "__tests__", "__pycache__", ".cache", "coverage",
    ".idea", ".vscode", "tmp", "log", "logs",
})

EXCLUDE_FILENAMES: frozenset[str] = frozenset({
    "package-lock.json", "yarn.lock", "composer.lock",
    "pnpm-lock.yaml", "Gemfile.lock", "poetry.lock", "Cargo.lock",
})

INCLUDE_EXTENSIONS: frozenset[str] = frozenset({
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".php", ".rb", ".go", ".rs", ".java", ".kt",
    ".json", ".yml", ".yaml", ".toml",
    ".vue", ".svelte",
})

# ~200K input tokens — under Gemini free-tier's 250K input-tokens/minute cap.
MAX_TOTAL_CHARS = 800_000
# Skip suspiciously large files (likely generated, minified, or bundled).
MAX_PER_FILE_CHARS = 50_000
# Hard cap on files even before we look at content size. Prevents OOM on big repos.
MAX_FILES_TO_FETCH = 500

_RELEVANT_PATH_RE = re.compile(
    r"\b(api|route|controller|endpoint|handler|view|resource|model)\b",
    re.IGNORECASE,
)


class SourceFile(NamedTuple):
    path: str
    content: str


def filter_source_files(all_paths: list[str]) -> list[str]:
    out: list[str] = []
    for path in all_paths:
        parts = path.split("/")
        if any(p in EXCLUDE_DIRS for p in parts):
            continue
        filename = parts[-1]
        if filename in EXCLUDE_FILENAMES:
            continue
        if filename.startswith(".") and filename != ".env.example":
            continue
        dot = filename.rfind(".")
        if dot == -1:
            continue
        if filename[dot:] not in INCLUDE_EXTENSIONS:
            continue
        out.append(path)
    return out


def _relevance(path: str) -> int:
    return 0 if _RELEVANT_PATH_RE.search(path) else 1


def rank_source_files(paths: list[str]) -> list[str]:
    """Sort by API/route relevance first, then by path length (shorter = more
    likely a top-level route file)."""
    return sorted(paths, key=lambda p: (_relevance(p), len(p)))


def trim_to_budget(files: list[SourceFile]) -> list[SourceFile]:
    """Final safety trim — drops oversized files, stops at the char budget."""
    sorted_files = sorted(files, key=lambda f: (_relevance(f.path), len(f.path)))
    out: list[SourceFile] = []
    total = 0
    for f in sorted_files:
        if not f.content or len(f.content) > MAX_PER_FILE_CHARS:
            continue
        if total + len(f.content) > MAX_TOTAL_CHARS:
            break
        out.append(f)
        total += len(f.content)
    return out
