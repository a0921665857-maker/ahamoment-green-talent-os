# ARCHITECTURE.md

## Stack
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Storage) · Vercel · Anthropic API (claude-sonnet-4-6 quality paths, claude-haiku-4-5 cheap paths) · zod for every LLM/data boundary. No queue, no Redis, no auth provider in V1.

## System flow
```
Browser ── /{locale} pages (server components + small client islands)
   │ POST /api/mri/submit      → store source_material → extraction prompt → extracted_profiles
   │ POST /api/mri/confirm     → save user_edits → missingInfoDetector → question IDs
   │ POST /api/mri/answers     → save answers+email → scoring prompt → resultClassifier → scores
   │                            → report prompt (native locale) → reports → admin_summary (Haiku, async-ish)
   │ GET  /{locale}/result/[token]  → render report
Admin ── /admin (password middleware) → leads table, lead detail, memo viewer, delete, status
```
All Anthropic + Supabase service-role calls happen in API routes / server actions only. The browser never sees keys or raw model output.

## Repo structure (target, per brief §21 with adopted deltas)
```
app/[locale]/(page.tsx, mri/, result/[token]/, privacy/)   app/admin/   app/api/mri/*  app/api/admin/*
components/ (LanguageSwitcher, LandingHero, MRIIntakeFlow, ConsentBox, SourceMaterialInput,
             ProfileConfirmation, MissingQuestions, MRILiteReport, PaidOfferCTA, LeadCaptureForm,
             AdminLeadTable, ScoreBreakdown, MemoDraftViewer)
content/ (locales.ts, schema.ts, en/*, zh-TW/*)            lib/ (extraction/, scoring/, prompts/, taxonomy.ts, supabase.ts, types.ts, anthropic.ts, rateLimit.ts)
supabase/ (schema.sql, seed.sql)                           tests/ (scoring.test.ts, resultClassifier.test.ts, contentSchema.test.ts, fixtures/)
docs/ (this folder)                                        README.md  .env.example
```
Deltas from the brief's sketch: `[locale]` segment wraps user pages; `result/[token]` dynamic; `errors.ts`/`emails.ts` added to content; `rubrics.ts` + `taxonomy.ts` in lib; fixtures in tests. Rationale in DESIGN_REVIEW_PHASE1.md.

## Error handling (binding pattern)
LLM call → zod parse → fail ⇒ one repair retry → fail ⇒ degraded mode:
- extraction: status `failed`, friendly retry UI, admin flag.
- scoring: retry once; fail ⇒ category `profile_building_needed` + `degraded=true` + admin flag.
- report: per-section fallback lines from `reportTemplates.ts`; `degraded=true`; user still gets a report.
User-facing error copy from `content/{locale}/errors.ts`.

## Abuse & cost protection
`lib/rateLimit.ts`: per-IP sliding window on `/api/mri/*` (e.g., 5 submissions/hour/IP, in-Postgres counter — no Redis); max 40k chars text / 10MB PDF; max 2 regeneration attempts per session. Anthropic spend alert configured in console (manual step in launch checklist).

## Deployment notes
- Env vars (see .env.example): ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (unused for data; RLS deny-all), ADMIN_PASSWORD, ADMIN_SESSION_SECRET, NEXT_PUBLIC_SITE_URL, CALENDLY_URL, STRIPE_PAYMENT_LINKS (placeholders).
- Long LLM calls: set route `maxDuration` (60–300s) and verify the Vercel plan supports it at Phase 3 deploy; if Hobby limits bite, upgrade to Pro or stream. Logged as KNOWN_LIMITATIONS item.
- Admin auth: middleware checks signed httpOnly cookie; login form posts ADMIN_PASSWORD; constant-time compare. Upgrade path: Supabase Auth single allow-listed email (V1.1 if needed).
- PDFs: uploaded to private Storage bucket; passed to Anthropic as a base64 document block (no pdf parser dependency).

## Cost model (per completed free MRI)
Sonnet 4.6 ($3/$15 per MTok): extraction + scoring + report ≈ 18k in / 5k out ≈ $0.13. Haiku summary ≈ $0.01. **≈ US$0.14**; 100 MRIs ≈ $14 + Vercel/Supabase free-to-low tiers. A paid teardown at $249 covers ~1,700 free MRIs of COGS.

## What is deliberately NOT here
Queues, webhooks, cron infra (purge is a documented manual SQL until volume justifies pg_cron), caching layers, feature flags, analytics SaaS, component libraries beyond Tailwind. Every absent dependency is future maintenance a cheap model never has to understand.
