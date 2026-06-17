# MAINTENANCE_GUIDE.md

## Weekly routine (≈20 min)
1. Admin dashboard: triage new leads by grade (A first); send D0/D2/D6 drafts due; update followup_status.
2. Run the 90-day purge SQL (below) — until pg_cron is enabled.
3. Glance at Anthropic console spend + Vercel/Supabase usage.
4. Skim `extracted_profiles` free_text terms; promote recurring ones into `lib/taxonomy.ts`.

## Purge SQL (raw materials > 90 days)
```sql
update source_materials
set raw_text = null, purged_at = now()
where created_at < now() - interval '90 days' and purged_at is null;
-- then delete corresponding Storage objects listed by file_path (admin script in V1.1; manual via Supabase UI until then)
```

## Funnel query
```sql
select name, count(distinct session_id) from events
where created_at > now() - interval '14 days'
group by name order by 2 desc;
```

## Where things live (map for humans and cheap models)
| Change | File(s) |
|---|---|
| Any user-facing copy | `content/{locale}/*.ts` |
| Question bank | `content/{locale}/questions.ts` (+ detector priorities in `lib/extraction/missingInfoDetector.ts`) |
| Weights / thresholds | `lib/scoring/scoreWeights.ts` |
| Category rules | `lib/scoring/resultClassifier.ts` (+ tests) |
| Rubric anchors | `lib/scoring/rubrics.ts` |
| Prompts | `lib/prompts/*.ts` (bump `version`) |
| Offers & mapping | `content/{locale}/paidOffers.ts` + PAID_OFFER_STRATEGY.md table |
| Taxonomy | `lib/taxonomy.ts` |
| DB schema | `supabase/schema.sql` (additive migrations only) |

## Deploy
Push to main → Vercel auto-deploy. Schema changes: run migration SQL in Supabase SQL editor BEFORE deploying code that needs it. Always `npm test` + `npm run build` locally first.

## Backups & incidents
Supabase daily backups (verify enabled at launch). LLM failures surface as `degraded=true` / admin flags — re-run from the lead detail page after checking the prompt change log (CHANGELOG.md). If Anthropic API is down: intake keeps accepting and stores materials; sessions sit at `input_received` for later re-run (graceful queue-less degradation).

## Versioning discipline
Any prompt/rubric/classifier change ⇒ bump its version string ⇒ note in CHANGELOG.md ⇒ rerun golden fixtures (`npm test`). Old artifacts keep old version stamps — never retro-edit stored outputs.
