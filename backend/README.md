# AutoMCP Backend (FastAPI)

Python rewrite of the AutoMCP backend. The Next.js frontend at
`../automcp/` calls this service over HTTP. Generated MCP servers are still
emitted as TypeScript (Cloudflare Workers runtime); Python just renders the
template.

## Setup

```bash
cd backend
python -m venv .venv
# Windows (Git Bash):
source .venv/Scripts/activate
# macOS / Linux:
# source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in keys
uvicorn app.main:app --reload --port 8000
```

Verify:

```bash
curl http://localhost:8000/health        # {"status":"ok"}
open http://localhost:8000/docs          # Swagger UI
```

## Layout

```
app/
  main.py                    FastAPI app + CORS + /health + router mounts
  config.py                  pydantic-settings, reads .env
  models.py                  Pydantic models mirroring the TS types
  routes/                    /api/* endpoints (one router per concern)
  scanner/                   github fetch + classify + filter + Gemini extract
  generator/                 Groq tool designer + worker code renderer
  deployer/                  Cloudflare Workers upload
  clients/                   thin wrappers for Gemini, Groq, Supabase
  backend_auth/              auth helper for user-configured backend APIs
templates/
  mcp-server.ts.tmpl         copy of automcp/templates/mcp-server.ts.tmpl
```

URL paths match the previous Next.js API surface exactly so the frontend
client change is just a base-URL switch (`NEXT_PUBLIC_BACKEND_URL`).
