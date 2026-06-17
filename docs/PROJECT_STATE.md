# PROJECT_STATE.md

## Current phase
Phase 3 (build) COMPLETE — approved by Michael 2026-06-12 with overrides logged below. V1 codebase built; all checkpoints green (tsc + 64 tests + next build). Awaiting Michael: Supabase project + env values + Vercel deploy + Phase 4 zh-TW review + `npm run seed` quality gate.
Checkpoints 1–3/8 DONE:
1. Scaffold (Next 16.2.9, TS, Tailwind v4), [locale] routing + middleware, typed content schema, full en + zh-TW config (12 files each).
2. supabase/schema.sql (+rate_limits table, salted ip_hash — additive) + seed.sql; lib/types.ts zod twins; lib/taxonomy.ts (15 sectors / 12 functions / 20 domains / 7 credentials, bilingual labels).
3. lib/scoring/{rubrics(v0.1), scoreWeights(v0.1), resultClassifier} + lib/extraction/missingInfoDetector + 64 unit tests incl. 8 golden seed vectors — ALL PASS.
4. lib/prompts/* (7 prompts: profile_extraction, dimension_scoring, mri_report [10 hard exclusions verbatim + specificity contract + word caps], admin_summary, teardown_memo, followup_email, translation) + lib/anthropic.ts (zod-validated, 1 repair retry, optional PDF block, PromptValidationError for degraded path) + lib/supabase.ts (lazy service client) + lib/rateLimit.ts (salted ip_hash, in-Postgres window). tsc + tests + build all green.

5. API routes (all nodejs runtime, maxDuration set): /api/mri/submit (multipart PDF or JSON paste; consent literal-true + length/size validation; rate limit; create session → source_material → extraction → extracted_profiles; status transitions; extraction-failure → status failed + friendly error), /api/mri/confirm (persist user_edits → applyUserEdits → selectQuestions → localized question defs), /api/mri/answers (save email/name/answers → scoreAndClassify [degraded→profile_building_needed] → scores row → generateReport [degraded→template fallbacks] → reports row → non-blocking admin_summary), /api/mri/event (EVENT_NAMES whitelist, structural props only), /api/admin/login (constant-time pw compare, HMAC-signed httpOnly cookie), /api/admin/lead (PATCH status/notes, DELETE = cascade child rows + anonymize session per DATA_MODEL). middleware.ts now gates /admin on the signed cookie (Web Crypto, edge-safe) with /admin/login open. lib/pipeline.ts + lib/http.ts + lib/events.ts + lib/adminAuth.ts added. tsc + 64 tests + build green (6 API routes compiled).

NOTE: the 7 LLM prompts cannot be executed in this sandbox (no ANTHROPIC_API_KEY). Golden classifier tests cover the deterministic logic; prompt OUTPUT quality is verified live at Michael's deploy (Phase 4 seed runner). The submit/answers routes therefore compile and validate but their LLM legs run for real only after deploy.
6. User-flow UI (calm-premium design system: pine/ink/paper, single green band ramp, band-scale glyph + scanline signature, CJK craft rules in CSS). Real landing (hero, 3-step sequence, 12-section preview, founder strip, offers teaser), LanguageSwitcher, ReturnReportLink (localStorage), MriIntakeFlow client island (tabs→inline consent→submit→scanline progress→editable confirmation→questions+binding email gate→progress→redirect /result/[token]), ProgressStages, MriLiteReport (12 numbered sections + band chips on the 6 diagnostic sections + limited-data note), PaidOfferCta (ctaOffers slots + credit/confidentiality), /privacy page, /result/[token] page (fetches via lib/reportData.ts). All copy from content/ only.
7. Admin UI (internal, English): login page + /api/admin/login (constant-time pw, HMAC httpOnly cookie), middleware gate on /admin, dashboard (AdminLeadTable newest-first/grade-sorted via lib/adminData.ts), lead detail (source, profile+confidence, user edits, answers, ScoreBreakdown [raw scores + low-conf exclusion flag, admin-only], category+offers, EN summary, MemoDraftViewer), LeadControls (status save + delete wired to /api/admin/lead).
8. Phase 4 assets: tests/fixtures/seedInputs.ts (8 realistic bilingual seed texts matching ROADMAP matrix) + scripts/run-seeds.ts (live extraction→scoring→report runner, `npm run seed`, needs ANTHROPIC_API_KEY, prints reports + category pass/fail). README rewritten with setup/commands/deploy. tsc + 64 tests + build all green; full route table compiles.

## What remains for Michael (not blocking the build)
- Create Supabase project; run supabase/schema.sql (+ seed.sql); confirm private bucket.
- Fill .env.local / Vercel env (ANTHROPIC_API_KEY, SUPABASE_*, ADMIN_PASSWORD, ADMIN_SESSION_SECRET minimum).
- `npm run seed` to validate live prompt output; read all zh-TW report bodies (Phase 4 quality gate); tune rubrics/scoreWeights if needed (then rerun `npm test`).
- Deploy to Vercel; verify maxDuration on the plan; set Anthropic spend alert.
- Resolve EP/legal before enabling Calendly/Stripe (paid launch only).

## Phase 3 overrides (binding, from Michael 2026-06-12)
O1 Email gate stays; copy MUST read as report delivery — exact bilingual copy stored in content/{locale}/questions.ts emailGate.body.
O2 Free report includes the 6 named items (= sections 1,2,4,5,6,11 of the 12) and must exclude the named deliverables — already enforced by FREE_REPORT_STRATEGY hard-exclusion list.
O3 zh-TW built as designed; Michael reviews all zh outputs in Phase 4.
O4 EP/legal does not block building; blocks public PAID launch only.
All four env placeholders (Calendly, Stripe, privacy email, site URL) remain placeholders.

## Completed work
- Phase 0: assumptions documented (below).
- Phase 1: 14-perspective review with 16 adopted design changes → `DESIGN_REVIEW_PHASE1.md`.
- Phase 2: all strategy/architecture docs written (see file list).

## Files created (this checkpoint)
docs/: DESIGN_REVIEW_PHASE1, PRODUCT_THESIS, CUSTOMER_JOURNEY, UX_PRINCIPLES, BILINGUAL_CONTENT_SYSTEM, FREE_REPORT_STRATEGY, PAID_OFFER_STRATEGY, DATA_MODEL, TALENT_GRAPH_SCHEMA, PROFILE_EXTRACTION_MODEL, SCORING_MODEL, PROMPT_LIBRARY, PRIVACY_AND_CONSENT, SEO_STRATEGY, ARCHITECTURE, MAINTENANCE_GUIDE, LOW_TOKEN_UPDATE_GUIDE, ROADMAP, KNOWN_LIMITATIONS, PROJECT_STATE, NEXT_ACTIONS, CHANGELOG · plus README.md, .env.example.

## Key decisions (binding unless Michael overrides)
1. Front door = career positioning, MBA as a lens inside it (validated by Michael's own discovery).
2. Email gate at the missing-questions step, framed as report delivery.
3. Report CTA shows max 3 offers (category primary + teardown entry + full-package anchor); teardown credits toward sprints (30 days).
4. LLM extracts and scores; deterministic TS classifier picks category; deterministic detector picks questions from a stable bank.
5. Bands (Emerging/Developing/Strong) user-facing; raw scores admin-only.
6. Reports generated natively per locale; EN admin summary on Haiku; `[locale]` routing + typed content config from day 1.
7. Taxonomy slugs (sectors/functions/domains/credentials) from day 1 = talent-graph seed.
8. Privacy: required + optional(aggregate) consent; 90-day raw purge; PII-minimized profiles; transcripts only (no audio); deletion ≤7 days; no training on user data.
9. Models: claude-sonnet-4-6 (extraction/scoring/report/memo), claude-haiku-4-5 (summaries/emails); zod-validated JSON + repair retry + degraded fallbacks; ≈US$0.14 COGS per MRI; per-IP rate limits.
10. Admin: single-password middleware. PDFs via Anthropic document blocks (no parser lib). Voice recording deferred to V1.1.

## Phase 0 assumptions made (flag any that are wrong)
A1 Domain/brand placement TBD (env var only) · A2 prices as placeholders from the brief · A3 Calendly/Stripe placeholders · A4 Anthropic API key available · A5 Supabase + Vercel accounts (free tiers OK to start) · A6 beta = ~20 users from Michael's network/Threads · A7 locale codes en / zh-TW · A8 manual email sends in V1 · A9 no user accounts in V1 · A10 Michael writes/refines final rubric anchor wording (v0.1 drafted in SCORING_MODEL.md).

## Open questions (none blocking)
Q1 domain placement (SEO_STRATEGY) · Q2 final prices · Q3 EP/legal structure for charging (KNOWN_LIMITATIONS #1) · Q4 contact email for privacy page.

## Known issues
None in artifacts; product risks tracked in KNOWN_LIMITATIONS.md.

## Next recommended action
Michael reviews PRODUCT_THESIS, SCORING_MODEL (classifier rules + anchors), PAID_OFFER_STRATEGY (mapping), PRIVACY_AND_CONSENT (consent copy) → approves/edits → sends the Phase 3 prompt in NEXT_ACTIONS.md.

## How to resume after interruption
Any model: read this file + NEXT_ACTIONS.md first; load only the docs named for the task at hand (LOW_TOKEN_UPDATE_GUIDE.md discipline applies). Phase 3 build order is specified in NEXT_ACTIONS.md.
