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

create index if not exists idx_mcp_kb_embedding
  on mcp_knowledge_base
  using ivfflat (embedding vector_cosine_ops);

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
