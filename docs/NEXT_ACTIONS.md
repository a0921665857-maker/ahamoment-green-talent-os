# NEXT_ACTIONS.md

## Immediate next task (builder)
Phase 3 build is COMPLETE. Immediate next steps are Michael's (no further code needed to ship the free beta):
1. Create Supabase project → run supabase/schema.sql (+ optional seed.sql) → confirm private `source-materials` bucket exists.
2. Copy .env.example → .env.local (and Vercel env); fill ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_PASSWORD, ADMIN_SESSION_SECRET.
3. `npm run dev`, walk one EN and one zh-TW MRI end to end.
4. `ANTHROPIC_API_KEY=... npm run seed -- --full` → read all 8 reports, especially zh-TW (Phase 4 quality gate). Tune lib/scoring/rubrics.ts + scoreWeights.ts if needed, rerun `npm test`.
5. Deploy to Vercel; confirm route maxDuration on the plan; set an Anthropic spend alert.
6. EP/legal sign-off before enabling Calendly/Stripe (paid launch only — free beta is fine now).

## V1.1 backlog (after beta signal — see ROADMAP.md)
Resend email automation (D0/D2/D6 drafts already generated), real Stripe + payments table, in-browser voice capture, OG share image, pg_cron purge, Supabase Auth for admin.

## Previously
Michael reviews and approves the design. Minimum review set (≈15 min): PRODUCT_THESIS.md · SCORING_MODEL.md (rules + rubric anchors) · PAID_OFFER_STRATEGY.md (category→offer table) · PRIVACY_AND_CONSENT.md (consent copy) · KNOWN_LIMITATIONS.md item 1 (EP/legal — acknowledge plan).

## Exact prompt to paste to begin Phase 3
```
Phase 3 approved. Read docs/PROJECT_STATE.md and docs/NEXT_ACTIONS.md, then build the V1
codebase exactly per docs/ARCHITECTURE.md and the binding decisions in PROJECT_STATE.md.

Overrides to the docs: [none / list mine]
Placeholders: CALENDLY_URL=[...], contact email for privacy page=[...], site URL=[...]

Build order (checkpoint + update PROJECT_STATE.md and NEXT_ACTIONS.md after each step):
1. Scaffold: Next.js + TS + Tailwind, [locale] routing, content schema + en & zh-TW config files
2. supabase/schema.sql + seed.sql, lib/types.ts (zod), lib/taxonomy.ts
3. lib/scoring (rubrics, scoreWeights, resultClassifier) + lib/extraction/missingInfoDetector
   + tests/ — make all tests pass before any UI
4. lib/prompts/* + lib/anthropic.ts (zod-validated calls, repair retry, degraded fallbacks)
5. API routes (/api/mri/*) with rate limiting
6. User flow pages/components (landing → intake → consent → confirm → questions → report)
7. Admin (middleware auth, lead table, detail, memo viewer, delete)
8. Run Phase 4 seed-profile tests per docs/ROADMAP.md matrix; fix; update docs.

Work incrementally, durable files over chat, run npm test + build at every checkpoint,
and stop with a checkpoint summary before hitting any limit.
```

## Files to inspect first (for the Phase-3 builder)
ARCHITECTURE.md → DATA_MODEL.md → PROFILE_EXTRACTION_MODEL.md → SCORING_MODEL.md → BILINGUAL_CONTENT_SYSTEM.md → FREE_REPORT_STRATEGY.md. (Journey/UX docs as needed per component.)

## Risks / dependencies before Phase 3
- Anthropic API key + Supabase project must exist (env values can land at deploy, but schema step needs the project).
- EP/legal question (KNOWN_LIMITATIONS #1) does NOT block building — it blocks charging. Free beta can proceed.
- zh-TW quality gate happens at Phase 4; budget Michael's review time for all 8 seed outputs.
