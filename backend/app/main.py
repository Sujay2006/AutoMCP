"""FastAPI entry point.

Mounts every router under `/api` so the URL paths match the previous Next.js
API surface 1:1, which keeps the frontend rewrite (Phase 6) trivial.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import connection, deploy, generate, rag, scan, test_tools, tools

app = FastAPI(
    title="AutoMCP Backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

# CORS: FRONTEND_ORIGIN can be a comma-separated list (localhost in dev,
# Vercel URL in production, etc.). We also allow any http://localhost:<port>
# via regex so a Next dev server that grabs a new port doesn't trip CORS.
_origins = [o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


# Routers — endpoints are wired up in Phase 5. Each router is mounted under
# /api so the resulting paths read /api/scan, /api/generate-mcp, etc.
app.include_router(scan.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(deploy.router, prefix="/api")
app.include_router(connection.router, prefix="/api")
app.include_router(test_tools.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
