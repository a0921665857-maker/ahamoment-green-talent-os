# CHANGELOG.md

## 2026-06-12 — Checkpoint: Phases 0–2 complete
- Phase 0 assumptions documented (PROJECT_STATE.md).
- Phase 1 brutal review: 14 perspectives, 16 adopted design changes (DESIGN_REVIEW_PHASE1.md), including: email gate placement, 3-offer CTA rule + teardown credit, deterministic classifier + question bank, native-locale report generation, taxonomy slugs from day 1, evidence-asset specificity contract, consent split + 90-day purge, rate limiting, [locale] routing, EP/legal founder risk flagged.
- Phase 2: full strategy + architecture doc set written (22 docs + README + .env.example).
- Awaiting approval to start Phase 3.

## 2026-06-12 — Phase 3 checkpoint 1
Approved with overrides O1–O4. Scaffolded Next 16/TS/Tailwind4; locale middleware; content schema + en/zh-TW config (12 files/locale incl. binding email-gate + consent copy). Build green.

## 2026-06-12 — Phase 3 checkpoints 2–3
Schema.sql (9 tables, RLS deny-all, rate_limits w/ salted ip_hash), zod types, bilingual taxonomy. Scoring core: rubrics v0.1, scoreWeights v0.1, deterministic classifier R0–R8 + offers + grades + CTA slots, missingInfoDetector. 64 tests green incl. golden seeds; tsc + next build green.

## 2026-06-12 — Phase 3 checkpoint 4
Prompt library (7 prompts, faithful to PROMPT_LIBRARY.md incl. verbatim report exclusions + specificity contract), Anthropic client with zod validation + single repair retry + PDF document-block support, lazy Supabase service client, salted in-Postgres rate limiter. tsc + 64 tests + build green.

## 2026-06-12 — Phase 3 checkpoint 5
Full API surface: MRI submit/confirm/answers/event + admin login/lead, with rate limiting, consent gating, the binding error+degraded patterns, PII-safe events, and HMAC admin cookie gating in middleware. Pipeline orchestration extracted to lib/pipeline.ts. tsc + 64 tests + build green; 6 routes compiled.

## 2026-06-12 — Phase 3 checkpoint 6
Full user-facing UI on a calm-premium design system (pine/ink/paper, band ramp, scanline + band-scale signatures, CJK craft rules). Landing, intake client island (consent→confirm→questions→email gate), 12-section report with band chips, paid CTA, privacy + result pages. All copy sourced from content/. tsc + 64 tests + build green.

## 2026-06-12 — Phase 3 checkpoints 7–8 (build COMPLETE)
Admin dashboard (lead table, full lead detail with admin-only raw ScoreBreakdown + memo viewer, status/delete controls, HMAC cookie gate). Phase 4 seed runner + 8 bilingual seed inputs; README rewritten for setup/deploy. Final gate: tsc + 64 tests + next build all green. V1 codebase complete; handoff items documented in PROJECT_STATE.md.
