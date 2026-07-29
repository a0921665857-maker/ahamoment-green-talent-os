-- Gate 8 WP-5 · 2026-07-30
-- Additive only. Creates one partial index so the daily purge sweep stays a
-- bounded lookup instead of a full scan as source_materials grows.
--
-- The 90-day promise is made in four places in the product copy; the sweep that
-- keeps it now runs from /api/cron/purge. This index is the only schema change
-- that sweep needs — no column is added, dropped or retyped, and no existing
-- data is read differently.
--
-- ROLLBACK:
--   drop index if exists source_materials_purge_idx;
-- Dropping it does not change behaviour, only the plan the sweep uses.

create index if not exists source_materials_purge_idx
  on source_materials (created_at)
  where purged_at is null;

comment on index source_materials_purge_idx is
  'Gate 8: supports the daily 90-day raw_text purge (lib/purge.ts). Partial on purged_at is null so already-purged rows fall out of the index entirely.';
