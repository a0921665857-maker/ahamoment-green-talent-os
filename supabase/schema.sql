-- AhaMoment Green Talent OS — V1 schema (DATA_MODEL.md)
-- Rules: additive migrations only; RLS deny-all (service-role from server routes is the only access path).

create extension if not exists pgcrypto;

-- one row per MRI run (the lead)
create table if not exists mri_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token uuid unique not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locale text not null check (locale in ('en','zh-TW')),
  status text not null default 'started' check (status in
    ('started','input_received','extracted','confirmed','questions_answered','report_generated','abandoned','failed')),
  input_type text check (input_type in ('cv_pdf','linkedin_paste','notes_paste','voice_transcript')),
  email text,
  name text,
  consent_processing_at timestamptz,
  consent_aggregate boolean not null default false,
  lead_grade char(1) check (lead_grade in ('A','B','C')),
  followup_status text not null default 'new' check (followup_status in ('new','contacted','booked','paid','closed')),
  paid_offer_purchased text,
  admin_notes text,
  deleted_at timestamptz
);

create table if not exists source_materials (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references mri_sessions(id) on delete cascade,
  type text not null check (type in ('cv_pdf','linkedin_paste','notes_paste','voice_transcript')),
  raw_text text,
  file_path text,                -- private Storage path for PDFs
  char_count integer not null default 0,
  created_at timestamptz not null default now(),
  purged_at timestamptz          -- 90-day purge stamps this, nulls raw_text, deletes storage object
);

create table if not exists extracted_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references mri_sessions(id) on delete cascade,
  payload jsonb not null,        -- ExtractedProfile (lib/types.ts)
  overall_confidence numeric not null,
  missing_fields text[] not null default '{}',
  user_edits jsonb,
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists question_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references mri_sessions(id) on delete cascade,
  question_id text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references mri_sessions(id) on delete cascade,
  dimension_scores jsonb not null,   -- {dim: {score, confidence, evidence}}
  weighted_summary jsonb not null,   -- WeightedSummary
  result_category text not null,
  primary_offer text not null,
  secondary_offer text,
  classifier_version text not null,
  rubric_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references mri_sessions(id) on delete cascade,
  locale text not null,
  sections jsonb not null,
  bands jsonb not null,
  limited_data boolean not null default false,
  model text not null,
  prompt_version text not null,
  degraded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists admin_summaries (
  session_id uuid primary key references mri_sessions(id) on delete cascade,
  summary_en text,
  summary_zh text,
  memo_draft jsonb,
  followup_drafts jsonb,
  model text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id bigserial primary key,
  session_id uuid references mri_sessions(id) on delete set null,
  name text not null,
  props jsonb not null default '{}'::jsonb,   -- enforced rule: never any PII in props
  created_at timestamptz not null default now()
);

-- per-IP sliding-window rate limiting without Redis (ARCHITECTURE.md).
-- Stores a salted hash of the IP, never the IP itself (no-PII rule).
create table if not exists rate_limits (
  id bigserial primary key,
  ip_hash text not null,
  route text not null,
  created_at timestamptz not null default now()
);

-- indexes (DATA_MODEL.md)
create index if not exists idx_sessions_token on mri_sessions(session_token);
create index if not exists idx_sessions_status on mri_sessions(status);
create index if not exists idx_sessions_followup on mri_sessions(followup_status);
create index if not exists idx_sessions_created on mri_sessions(created_at desc);
create index if not exists idx_scores_category on scores(result_category);
create index if not exists idx_events_session on events(session_id);
create index if not exists idx_events_name_created on events(name, created_at);
create index if not exists idx_rate_limits_window on rate_limits(ip_hash, route, created_at);

-- updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
drop trigger if exists trg_sessions_updated on mri_sessions;
create trigger trg_sessions_updated before update on mri_sessions
  for each row execute function set_updated_at();

-- RLS: deny-all. Enable RLS with no policies; only the service-role key (server routes) can read/write.
alter table mri_sessions enable row level security;
alter table source_materials enable row level security;
alter table extracted_profiles enable row level security;
alter table question_answers enable row level security;
alter table scores enable row level security;
alter table reports enable row level security;
alter table admin_summaries enable row level security;
alter table events enable row level security;
alter table rate_limits enable row level security;

-- private storage bucket for CV PDFs
insert into storage.buckets (id, name, public)
values ('source-materials', 'source-materials', false)
on conflict (id) do nothing;

-- 《綠領情報》週刊訂閱者(see supabase/migrations/20260712_newsletter_subscribers.sql)
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  locale text not null check (locale in ('en','zh-TW')),
  status text not null default 'active' check (status in ('active','unsubscribed')),
  source text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create index if not exists idx_newsletter_email on newsletter_subscribers(email);
create index if not exists idx_newsletter_status on newsletter_subscribers(status);
alter table newsletter_subscribers enable row level security;
