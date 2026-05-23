# AutoMCP

Turn any website or GitHub repo into an AI-agent-ready **MCP server** in under
60 seconds — no manual coding.

**Live:** https://automcp.vercel.app

## How it works

1. Paste a GitHub repo URL or website URL.
2. Gemini 2.5 Flash scans the code and extracts user-facing actions.
3. Llama 3.3 70B (via Groq) designs a clean set of MCP tools.
4. You confirm/edit the tools in the UI.
5. (Real-backend path) Connect your live API + verify each tool with a probe.
6. We render a working MCP server and deploy it to Cloudflare Workers.
7. You get a stable URL to paste into Claude.ai, ChatGPT, or Cursor.

The Akaunting demo button on the landing page is a one-click shortcut — it
skips the scan + backend steps and ships an MCP with baked-in mock data.

## Architecture

```
┌─────────────────────┐         ┌──────────────────────────────┐
│  Next.js 15 (UI)    │         │  FastAPI backend (Python)    │
│  Vercel             │ ──────▶ │  Railway                     │
│  automcp.vercel.app │         │  automcp-backend-production  │
│                     │         │      .up.railway.app         │
└─────────────────────┘         └──────────────┬───────────────┘
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          ▼                     ▼                     ▼
                    ┌──────────┐         ┌──────────┐         ┌──────────────┐
                    │ Supabase │         │  Gemini  │         │   Cloudflare │
                    │ Postgres │         │   Groq   │         │   Workers    │
                    │  projects│         │   APIs   │         │ (generated   │
                    │  table   │         │          │         │  MCP target) │
                    └──────────┘         └──────────┘         └──────────────┘
```

Generated MCP servers stay **TypeScript** (Cloudflare Workers runtime). The
Python backend renders the Worker template at `automcp/backend/templates/mcp-server.ts.tmpl`
with project-specific JSON literals — no per-tool handler code is generated,
so the output is structurally always valid.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15.5 (App Router) + React 19 + Tailwind 4 + shadcn/ui |
| Frontend hosting | Vercel |
| Backend | FastAPI + Pydantic v2 + httpx + supabase-py + google-genai + groq + PyGithub |
| Backend hosting | Railway (Docker) |
| Database | Supabase (Postgres) |
| Scanner LLM | Gemini 2.5 Flash |
| Tool designer LLM | Llama 3.3 70B via Groq |
| Generated MCP runtime | Cloudflare Workers (TypeScript ES module) |

## Repository layout

```
MCPBuilder/
├── automcp/                       # active project — Next.js frontend + FastAPI backend
│   ├── app/                       # Next.js pages (no api/ — that's the backend now)
│   ├── components/                # React UI components
│   ├── lib/
│   │   ├── api-client.ts          # fetch wrapper that prepends NEXT_PUBLIC_BACKEND_URL
│   │   ├── types.ts               # shared types
│   │   └── utils.ts               # cn() and friends
│   ├── backend/                   # FastAPI service (Python)
│   │   ├── app/
│   │   │   ├── main.py            # FastAPI app + CORS + /health
│   │   │   ├── config.py          # pydantic-settings (.env loader)
│   │   │   ├── models.py          # Pydantic models (mirror lib/types.ts)
│   │   │   ├── db.py              # async wrappers around sync supabase-py
│   │   │   ├── demo.py            # hand-curated Akaunting data
│   │   │   ├── routes/            # one router per concern
│   │   │   ├── scanner/           # github fetch + classify + filter + Gemini extract
│   │   │   ├── generator/         # Groq tool designer + Worker code renderer
│   │   │   ├── deployer/          # Cloudflare Workers upload
│   │   │   ├── clients/           # gemini, groq, supabase wrappers
│   │   │   └── backend_auth/      # auth.py — basic/bearer/api_key_header/api_key_query
│   │   ├── templates/             # mcp-server.ts.tmpl (the Cloudflare Worker template)
│   │   ├── Dockerfile             # Python 3.12 slim, listens on $PORT
│   │   ├── requirements.txt
│   │   └── .env.example
│   ├── supabase-schema.sql        # canonical projects-table schema
│   ├── package.json               # frontend deps
│   └── .env.example               # frontend env (NEXT_PUBLIC_BACKEND_URL etc.)
└── nextjs-backend-archive/        # historical: the original TypeScript backend (Phase 8'd out)
```

## Getting started — local dev

You need both servers running.

**Terminal 1 — FastAPI backend (port 8000):**
```bash
cd automcp/backend
python -m venv .venv
source .venv/Scripts/activate     # Windows; on macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # then fill in keys
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Next.js frontend (port 3000):**
```bash
cd automcp
npm install
cp .env.example .env.local        # then fill in keys including NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Var | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | backend | Code scanning (Gemini 2.5 Flash) |
| `GROQ_API_KEY` | backend | Tool design (Llama 3.3 70B) |
| `GITHUB_TOKEN` | backend | Optional — bumps GitHub API rate limit (CDN raw fetches work without it) |
| `SUPABASE_URL` | backend | Postgres project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Server-side DB access (bypasses RLS) |
| `CLOUDFLARE_ACCOUNT_ID` | backend | Workers account |
| `CLOUDFLARE_API_TOKEN` | backend | Workers Scripts:Edit token |
| `CLOUDFLARE_WORKERS_SUBDOMAIN` | backend | Your workers.dev subdomain |
| `FRONTEND_ORIGIN` | backend | CORS allowlist — comma-separated for multiple |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | Where the React app sends API calls (Railway URL in prod) |

## Supabase setup

Run `automcp/supabase-schema.sql` once in the Supabase SQL editor. It creates
the `projects` table with all required columns (including `current_step`,
`fetch_progress`, `backend_config`, `tool_test_results`).

## Production deploy

**Backend (Railway):**
```bash
cd automcp/backend
railway login
railway init --name automcp-backend
# set every env var via railway variables --set "KEY=VALUE"
railway up
railway domain   # generates the public URL
```

**Frontend (Vercel):**
```bash
cd automcp
vercel
# In Vercel dashboard: set NEXT_PUBLIC_BACKEND_URL to the Railway URL
vercel --prod
```

Also set `FRONTEND_ORIGIN` on Railway to include the Vercel URL so CORS works:
```
FRONTEND_ORIGIN=https://automcp.vercel.app,http://localhost:3000
```

---

Built at a hackathon. YC S26 "Software for Agents" RFS validated.
