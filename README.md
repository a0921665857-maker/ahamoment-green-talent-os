# AhaMoment Green Talent OS

Bilingual (EN / 繁體中文) AI-native career diagnostic for APAC green-economy professionals.
V1 wedge: **Green Career MRI** — upload-first diagnostic → free 12-section Lite report → paid human-reviewed services.

**Status:** Phase 3 build complete (V1 codebase). Pending: live Supabase project, env values, deploy, and a Phase 4 zh-TW quality read.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Storage) · Anthropic API · zod at every LLM/data boundary. No queue, no Redis, no auth provider.

## How it works (one MRI)
1. `/{locale}/mri` — pick an input (CV PDF / LinkedIn / notes / voice transcript), give inline consent, submit.
2. `POST /api/mri/submit` → store raw → **extraction** (Sonnet) → editable confirmation page.
3. `POST /api/mri/confirm` → save edits → deterministic **question selection** (3–5).
4. `POST /api/mri/answers` → save email+answers → **scoring** (Sonnet) → **deterministic classifier** → **report** (Sonnet, native locale) → redirect to `/{locale}/result/[token]`.
5. Admin at `/admin` (password) reviews leads, raw scores, memo draft; can set follow-up status or delete a lead.

The LLM extracts and scores; a pure-TypeScript classifier (`lib/scoring/resultClassifier.ts`) picks the category. Users see bands (Emerging / Developing / Strong · 萌芽 / 發展中 / 紮實), never numbers.

## Setup
1. `npm install`
2. Create a Supabase project. In the SQL editor run `supabase/schema.sql` (9 tables, RLS deny-all, private `source-materials` bucket). Optionally `supabase/seed.sql`.
3. Copy `.env.example` → `.env.local` and fill values (see the file for the full contract). Minimum to run the flow end to end: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`. Calendly / Stripe / site URL / privacy email may stay placeholders for the free beta.
4. `npm run dev` → http://localhost:3000 (redirects to `/en` or `/zh-TW` by Accept-Language).

## Commands
- `npm run dev` — local dev
- `npm run build` — production build
- `npm test` — 64 unit tests (scoring, classifier incl. 8 golden seeds, content parity)
- `npm run typecheck` — `tsc --noEmit`
- `npm run seed` — **Phase 4 quality gate**: runs the real extraction→scoring→report pipeline against the 8 seed inputs and prints output (needs `ANTHROPIC_API_KEY`; does not touch Supabase). Add `--full` to print whole reports, `--only 2,8` to pick seeds.

## Deploy notes (Vercel)
- Set all env vars in the Vercel project.
- The submit/answers routes set `maxDuration` (120s / 180s). Confirm your plan allows it; upgrade from Hobby if long LLM calls are truncated.
- PDFs are sent to Anthropic as a base64 document block (no parser dependency).
- Raw-material 90-day purge is a manual SQL step in V1 (see `docs/MAINTENANCE_GUIDE.md`).

## Before charging real money
EP/legal structure for taking payment is unresolved and **blocks the public PAID launch only** — the free beta can proceed (see `docs/KNOWN_LIMITATIONS.md` item 1). Calendly/Stripe links are placeholders until then.

## Repo map
`app/(site)/[locale]/*` user pages · `app/(admin)/admin/*` admin · `app/api/*` routes · `components/*` UI · `content/{en,zh-TW}/*` all copy (no user-facing strings live in components) · `lib/*` extraction, scoring, prompts, taxonomy, clients · `supabase/*` schema · `tests/*` · `docs/*` strategy + architecture (start at `PROJECT_STATE.md`).

## Rules of the repo
- No user-facing copy in components — `content/{locale}` only.
- LLM extracts and scores; deterministic TypeScript classifies. All LLM I/O is zod-validated with one repair retry + degraded fallback.
- Additive DB migrations only. No PII in logs/events. Never promise career outcomes anywhere.
