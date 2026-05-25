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
                             includes routes/rag.py → GET /api/rag/stats
  scanner/                   github fetch + classify + filter + Gemini extract
  generator/                 Groq tool designer (RAG-augmented) + worker code renderer
  rag/                       custom RAG pipeline
                               embedder.py            sentence-transformers wrapper
                               retriever.py           cosine-similarity RPC + rolling stats
                               knowledge_base.jsonl   106 curated MCP tools
  deployer/                  Cloudflare Workers upload
  clients/                   thin wrappers for Gemini, Groq, Supabase
  backend_auth/              auth helper for user-configured backend APIs
scripts/
  build_embeddings.py        embed knowledge_base.jsonl → knowledge_base_with_embeddings.jsonl
  load_to_supabase.py        wipe + reinsert into mcp_knowledge_base
templates/
  mcp-server.ts.tmpl         copy of automcp/templates/mcp-server.ts.tmpl
```

## RAG bootstrap (one-time)

After applying `../rag-schema.sql` in the Supabase SQL editor:

```bash
.venv/Scripts/python -m scripts.build_embeddings   # ~10s, writes embeddings JSONL
.venv/Scripts/python -m scripts.load_to_supabase   # ~10s, populates Supabase
curl http://localhost:8000/api/rag/stats           # expect {"ready":true,"total_tools":106,...}
```

During scans you'll see `[rag] injected N few-shot examples into Groq prompt`
in the uvicorn log when retrieval succeeds.

URL paths match the previous Next.js API surface exactly so the frontend
client change is just a base-URL switch (`NEXT_PUBLIC_BACKEND_URL`).
