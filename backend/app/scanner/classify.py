"""Project-type classifier — port of automcp/lib/scanner/classify.ts.

Pure function over the repo's file paths. Used as a hint in the Gemini prompt
(``Project type: laravel`` etc.). Backend frameworks come first because many
full-stack apps ship package.json for frontend assets and were being mislabeled
as "next".
"""

from __future__ import annotations

from app.models import Classification


def classify_project(file_paths: list[str]) -> Classification:
    signals: list[str] = []
    type_ = "unknown"
    path_set = set(file_paths)

    def has(p: str) -> bool:
        return p in path_set

    def starts_with(prefix: str) -> bool:
        return any(p.startswith(prefix) for p in file_paths)

    def includes(sub: str) -> bool:
        return any(sub in p for p in file_paths)

    if has("composer.json"):
        signals.append("composer.json present")
        if includes("artisan") or starts_with("app/Http"):
            type_ = "laravel"
            signals.append("Laravel structure detected")
        elif includes("wp-content") or has("wp-config.php"):
            type_ = "wordpress"
            signals.append("WordPress structure detected")
        else:
            type_ = "php"
            signals.append("PHP project")
    elif has("manage.py") or has("requirements.txt"):
        type_ = "django"
        signals.append("Python project markers")
    elif has("Gemfile"):
        type_ = "rails"
        signals.append("Gemfile present")
    elif has("package.json"):
        signals.append("package.json present")
        if (
            has("next.config.js")
            or has("next.config.ts")
            or has("next.config.mjs")
        ):
            type_ = "next"
            signals.append("next.config present")
        elif starts_with("app/") or starts_with("pages/"):
            type_ = "next"
            signals.append("app/ or pages/ directory")
        else:
            type_ = "express"
            signals.append("Node project, no Next markers")
    elif any(p.endswith(".html") for p in file_paths):
        type_ = "static"
        signals.append("HTML files only")

    return Classification(
        type=type_,
        confidence=min(1.0, len(signals) / 3),
        signals=signals,
    )
