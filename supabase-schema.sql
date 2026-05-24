-- AutoMCP — Supabase schema. Run this once in the Supabase SQL editor.
-- Safe to re-run: every statement uses "if not exists".

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  source_url text not null,
  source_type text not null check (source_type in ('github', 'website', 'akaunting_demo')),
  status text not null default 'pending' check (status in ('pending', 'scanning', 'reviewing', 'generating', 'deployed', 'failed')),
  classification jsonb,
  detected_actions jsonb,
  proposed_tools jsonb,
  confirmed_tools jsonb,
  generated_code text,
  mcp_url text,
  error text
);

create index if not exists idx_projects_status on projects(status);

alter table projects disable row level security;

-- Phase B: backend wiring + tool test results
alter table projects add column if not exists backend_config jsonb;
alter table projects add column if not exists tool_test_results jsonb;

-- Real scan progress
alter table projects add column if not exists current_step text;
alter table projects add column if not exists fetch_progress jsonb;
