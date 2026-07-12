-- Migration: newsletter_subscribers (《綠領情報》週刊 email capture)
-- Additive, idempotent. RLS deny-all like every other table — only the
-- service-role key (server route /api/newsletter/subscribe) reads/writes.
--
-- HOW TO APPLY (Michael): paste this into Supabase → SQL Editor → Run.
-- It is also appended to supabase/schema.sql so a fresh bootstrap includes it.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  locale text not null check (locale in ('en','zh-TW')),
  status text not null default 'active' check (status in ('active','unsubscribed')),
  source text,                       -- which page/utm the signup came from (no PII beyond email)
  confirmed_at timestamptz,          -- reserved for double opt-in (not yet wired)
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index if not exists idx_newsletter_email on newsletter_subscribers(email);
create index if not exists idx_newsletter_status on newsletter_subscribers(status);

alter table newsletter_subscribers enable row level security;
