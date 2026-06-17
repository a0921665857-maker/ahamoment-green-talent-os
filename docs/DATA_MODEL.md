# DATA_MODEL.md

## Design rules
1. Pipeline separation: raw → extracted → scores → report → outcomes. Reports are derived artifacts; the **extracted profile corpus is the asset**.
2. Typed columns only for fields the admin filters/sorts on; everything else jsonb (schema lives in `lib/types.ts` + zod).
3. Additive migrations only. Never repurpose a column.
4. RLS: deny-all for anon/authenticated. Every DB access goes through server routes using the service-role key.

## Tables (Supabase / Postgres)

### `mri_sessions` — one row per MRI run (the lead)
| column | type | notes |
|---|---|---|
| id | uuid pk default gen_random_uuid() | |
| session_token | uuid unique not null | report URL token |
| created_at / updated_at | timestamptz | |
| locale | text not null | 'en' \| 'zh-TW' |
| status | text not null | started → input_received → extracted → confirmed → questions_answered → report_generated; or abandoned / failed |
| input_type | text | cv_pdf \| linkedin_paste \| notes_paste \| voice_transcript |
| email | text | captured at questions step |
| name | text | optional |
| consent_processing_at | timestamptz | required before processing |
| consent_aggregate | boolean default false | optional checkbox |
| lead_grade | char(1) | A/B/C |
| followup_status | text default 'new' | new \| contacted \| booked \| paid \| closed |
| paid_offer_purchased | text | offer id |
| admin_notes | text | |
| deleted_at | timestamptz | soft delete; hard delete via purge job |

### `source_materials`
id, session_id fk, type, raw_text (nullable), file_path (Supabase Storage, private bucket, for PDFs), char_count, created_at, **purged_at** (90-day purge sets raw_text=null, deletes storage object, stamps purged_at).

### `extracted_profiles`
id, session_id fk, payload jsonb (`ExtractedProfile`, see PROFILE_EXTRACTION_MODEL.md), overall_confidence numeric, missing_fields text[], user_edits jsonb, model text, prompt_version text, created_at.

### `question_answers`
id, session_id fk, question_id text (stable bank ID), answer text, created_at.

### `scores`
id, session_id fk, dimension_scores jsonb (`{dim: {score, confidence, evidence}}`), weighted_summary jsonb, result_category text, primary_offer text, secondary_offer text, classifier_version text, rubric_version text, created_at.

### `reports`
id, session_id fk, locale, sections jsonb, bands jsonb, limited_data boolean, model, prompt_version, degraded boolean default false, created_at.

### `admin_summaries`
session_id fk, summary_en text, summary_zh text, memo_draft jsonb, followup_drafts jsonb, model, created_at.

### `events`
id bigserial, session_id fk nullable, name text, props jsonb, created_at. (Funnel analytics, first-party.)

## Taxonomy (graph seed — V1 source of truth is TypeScript)
`lib/taxonomy.ts` exports controlled vocabularies with stable slugs and bilingual labels:
- `sectors` (~15): carbon-markets, esg-advisory, corporate-sustainability, green-finance, impact-investing, climate-tech, renewable-energy, sustainable-supply-chain, climate-policy, nature-biodiversity, esg-data-ratings, sustainability-saas, circular-economy, energy-transition, climate-risk
- `functions` (~12): consulting, customer-success, sales-bd, product, strategy, finance-investment, operations, policy-regulatory, research-analytics, marketing-comms, engineering-technical, founder-gm
- `domains` (~20 expertise tags): sbti, ghg-scope123, cbam, tcfd, tnfd, csrd, gri, sasb, vcm, article-6, corsia, lca, renewable-ppa, carbon-accounting, esg-reporting, due-diligence, green-bonds, blue-carbon, reforestation, cookstoves
- `credentials`: mba, cfa, gri-certified, sasb-fsa, pmp, …
Extraction maps to slugs (+ `free_text[]` fallback for unmapped terms — review free_text monthly to grow taxonomy). Migration to DB tables happens when employer-side products need it (see TALENT_GRAPH_SCHEMA.md).

## Indexes
sessions(session_token), sessions(status), sessions(followup_status), sessions(created_at desc), scores(result_category), events(session_id), events(name, created_at).

## Retention & deletion
- 90-day raw purge: SQL in MAINTENANCE_GUIDE.md (manual weekly in V1; pg_cron later).
- User deletion request → admin "Delete lead" button: hard-deletes source_materials + storage object, extracted_profiles, reports, admin_summaries, question_answers; anonymizes session row (email/name nulled, deleted_at stamped). Events kept (no PII in props — enforced rule).

## Evolution path
v1.1: payments table (Stripe webhook). v2: users table + auth, profile versioning (re-runs). v3: taxonomy to DB, edges table (see TALENT_GRAPH_SCHEMA.md).
