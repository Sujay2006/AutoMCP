-- AutoMCP RAG schema — pgvector + knowledge base table + similarity RPC.
-- Run once in the Supabase SQL editor (project wfwstmgskcjbcwmgmbps).
-- Safe to re-run: every statement uses "if not exists" / "or replace".

create extension if not exists vector;

create table if not exists mcp_knowledge_base (
  id serial primary key,
  tool_name text not null,
  description text not null,
  category text,
  input_schema jsonb,
  source_mcp text,
  embedding vector(384)
);

-- ivfflat is *bad* at the scale we ship at (~100 rows): with 100 lists and the
-- default probes=1, a query only scans ~1 list and returns 1 quasi-random hit.
-- Drop it; pg will sequentially scan ~100 rows in microseconds. When the KB
-- grows past ~10k rows, add an HNSW index instead — it doesn't need a probes
-- knob and works correctly out of the box.
drop index if exists idx_mcp_kb_embedding;

create index if not exists idx_mcp_kb_category
  on mcp_knowledge_base (category);

-- Cosine similarity search. Returns top-k tools ranked by similarity (1.0 = identical).
create or replace function match_tools(query_embedding vector(384), match_count int)
returns table (
  id int,
  tool_name text,
  description text,
  category text,
  input_schema jsonb,
  source_mcp text,
  similarity float
)
language sql
as $$
  select
    id,
    tool_name,
    description,
    category,
    input_schema,
    source_mcp,
    1 - (embedding <=> query_embedding) as similarity
  from mcp_knowledge_base
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
