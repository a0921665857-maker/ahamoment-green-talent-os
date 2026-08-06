# MAINTENANCE_GUIDE.md

## Weekly routine (≈20 min)
1. Admin dashboard: triage new leads by grade (A first); send D0/D2/D6 drafts due; update followup_status.
2. Run the 90-day purge SQL (below) — until pg_cron is enabled.
3. Glance at Anthropic console spend + Vercel/Supabase usage.
4. Skim `extracted_profiles` free_text terms; promote recurring ones into `lib/taxonomy.ts`.

## Monthly: refresh the Singapore official data (≈10 min, 5th of the month)

Powers the official block on `/[locale]/cost-of-living`. Four datasets are rendered
(HDB median rent, SingStat CPI, MOM median income, MOM unemployment); two more are
carried but not shown (HDB resale = buying not monthly cost, foreign workforce =
discontinued by MOM after 2022-12).

```
python C:\Users\michael\sg-dashboard\refresh.py     # the only step that goes online
cd <this repo>
python scripts/export_sg_official.py --sync          # copy 6 JSONs in, regenerate the snapshot
npm run typecheck && npx vitest run
git checkout -b data/sg-official-<yyyy-mm>           # feature branch, never straight to main
```

- **Do not shorten refresh.py's throttle.** The keyless data.gov.sg quota 429s after
  about a dozen quick requests; 4 seconds between calls and 60/90/120s backoff are
  deliberate. Never parallelise, never fetch at build time, never fetch from this repo.
- **The export script does not go online.** It reads `content/sg-official/*.json`, so
  `--check` re-derives every published figure offline, from files in the same commit.
- **`content/sgOfficial.ts` is generated. Do not hand-edit it.** Prose lives in
  `content/sgOfficialCopy.ts` and holds `{token}` placeholders only, never typed-in
  figures, so refreshed data flows into the sentences automatically.
- **`tests/sgOfficial.test.ts` pins the reconciled snapshot on purpose.** When a
  refresh moves CENTRAL's rent or the CPI print, that test goes red. That is the
  prompt to re-read the copy for anything the new numbers have made untrue, then
  update the expected values in the same commit. Do not weaken the assertions.
- **Licence obligation, non-negotiable.** All six datasets are Singapore Open Data
  Licence v1.0: redistribution of derived analysis is allowed, attribution and a
  statement of non-affiliation are required. Both live in `licenceNote` and render
  unconditionally at the foot of the section. Never collapse or delete that line.
- **Staleness degrades, it does not hide.** After 90 days without a refresh the
  section keeps every number and adds a notice pointing at the official links. This
  is the opposite of `marketPulse`, which hides itself when stale because job links
  die. It depends on `export const revalidate` staying on the cost-of-living page;
  without it the check freezes at build time.
- **First-hand and second-hand never merge.** The estimate tables (Numbeo, Wise, blog
  surveys) are one person's budget; the official rent is a whole 4-room flat shared by
  two or three people. Different units, separate sections, no shared table, no shared
  arithmetic, and the official figures stay in SGD with no TWD conversion.

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
| SG official data (rent/CPI/income/unemployment) | `content/sg-official/*.json` (raw) → `scripts/export_sg_official.py` → `content/sgOfficial.ts` (generated); prose in `content/sgOfficialCopy.ts` |
| DB schema | `supabase/schema.sql` (additive migrations only) |

## Deploy
Push to main → Vercel auto-deploy. Schema changes: run migration SQL in Supabase SQL editor BEFORE deploying code that needs it. Always `npm test` + `npm run build` locally first.

## Backups & incidents
Supabase daily backups (verify enabled at launch). LLM failures surface as `degraded=true` / admin flags — re-run from the lead detail page after checking the prompt change log (CHANGELOG.md). If Anthropic API is down: intake keeps accepting and stores materials; sessions sit at `input_received` for later re-run (graceful queue-less degradation).

## Versioning discipline
Any prompt/rubric/classifier change ⇒ bump its version string ⇒ note in CHANGELOG.md ⇒ rerun golden fixtures (`npm test`). Old artifacts keep old version stamps — never retro-edit stored outputs.
