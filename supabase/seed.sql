-- Seed data. Taxonomy lives in lib/taxonomy.ts in V1 (DATA_MODEL.md) — nothing to seed there.
-- This file exists so `psql -f supabase/seed.sql` is a stable part of setup; it inserts one
-- inert demo session for verifying admin rendering, safe to delete from the dashboard.

insert into mri_sessions (locale, status, input_type, email, name, consent_processing_at, followup_status, admin_notes)
values ('en', 'started', 'notes_paste', null, null, now(), 'new', 'Seed row — delete me after verifying the admin table renders.')
on conflict do nothing;
