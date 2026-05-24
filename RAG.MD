TASK: Build a custom RAG system for tool design. This is Pillar 3 requirement — evaluators have explicitly said pure API calls don't count, we need our own retrieval/embedding work.
PHASE 1 — Knowledge base construction (90 min)

Create backend/app/rag/ directory.
Create backend/app/rag/knowledge_base.jsonl. Each line is a JSON object:
json{"tool_name": "create_invoice", "description": "Create a new invoice...", "category": "fintech", "input_schema": {...}, "source_mcp": "stripe-mcp"}

Populate it by scraping/curating from:

Anthropic's official MCP examples repo (github.com/modelcontextprotocol/servers)
mcp.so directory (browse, extract tool definitions)
Smithery's public MCPs
Stripe MCP, Linear MCP, GitHub MCP, Notion MCP, Cal.com MCP (these are public and have clean tool sets)


Aim for ~200 tools across categories: fintech, e-commerce, CRM, scheduling, communications, content, dev-tools.
Quality matters more than quantity — well-described tools beat poorly-described ones.

PHASE 2 — Embedding pipeline (60 min)

Add sentence-transformers==3.2.0 to requirements.txt.
Create backend/app/rag/embedder.py:

Load all-MiniLM-L6-v2 (384-dim, fast, free).
Helper: def embed_text(text: str) -> list[float].
Helper: def embed_tool(tool_dict: dict) -> list[float] — combines name + description + category into one embedding.


Create backend/scripts/build_embeddings.py — reads knowledge_base.jsonl, embeds each tool, writes to a new knowledge_base_with_embeddings.jsonl.

PHASE 3 — Vector store via Supabase pgvector (60 min)

In Supabase SQL Editor, enable pgvector and create the table:
sqlcreate extension if not exists vector;
create table if not exists mcp_knowledge_base (
  id serial primary key,
  tool_name text not null,
  description text not null,
  category text,
  input_schema jsonb,
  source_mcp text,
  embedding vector(384)
);
create index on mcp_knowledge_base using ivfflat (embedding vector_cosine_ops);

Create backend/scripts/load_to_supabase.py — reads the embeddings JSONL and inserts into the table.
Create backend/app/rag/retriever.py:

Function: async def retrieve_similar_tools(query_text: str, k: int = 5) -> list[dict].
Embeds the query, runs a Supabase RPC for cosine similarity search, returns top K.
Add a SQL function for the similarity query:
sqlcreate or replace function match_tools(query_embedding vector(384), match_count int)
returns table (id int, tool_name text, description text, category text, input_schema jsonb, similarity float)
language sql as $$
  select id, tool_name, description, category, input_schema,
    1 - (embedding <=> query_embedding) as similarity
  from mcp_knowledge_base
  order by embedding <=> query_embedding
  limit match_count;
$$;




PHASE 4 — Integration into tool designer (45 min)

Update backend/app/generator/tool_designer.py:

Before calling Groq, for each detected action, retrieve top 3 similar existing tools using the retriever.
Build a "few-shot examples" block from the retrieved tools.
Inject this block into the Groq system prompt with "Here are examples of well-designed MCP tools for similar APIs:" followed by the retrieved examples.


The system prompt should now use the few-shot examples to ground its output in real-world patterns.

PHASE 5 — Add a "RAG metrics" endpoint for the demo (30 min)

Create GET /api/rag/stats that returns:

Total tools in knowledge base
Categories covered
Average similarity score of last 10 retrievals


Show this on the success page as "RAG matched 3 similar tools from our knowledge base" — proves to judges/evaluators that retrieval is happening.

ACCEPTANCE:

Scan a new repo (e.g., listmonk).
In the tool designer logs, verify that retrieved examples appear in the Groq prompt.
Compare tool descriptions before/after RAG — they should be more consistent and higher quality.
The /api/rag/stats endpoint returns real numbers.

PILLAR 3 NARRATIVE FOR THE PITCH:
"AutoMCP includes a custom RAG system built on 200+ curated real-world MCP examples. When generating tools for a new repo, we embed detected actions using sentence-transformers, retrieve semantically similar tools from our vector knowledge base in Supabase pgvector, and inject them as few-shot examples into the LLM prompt. This grounds output in real-world patterns instead of letting the LLM hallucinate from general knowledge. Quality improves measurably and the system becomes a learning loop — every new MCP we generate can feed back into the knowledge base."
Begin with Phase 1.