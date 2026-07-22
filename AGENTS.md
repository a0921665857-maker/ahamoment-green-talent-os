# AhaMoment Green Talent OS — agent working rules (single source: Claude Code 與 Codex 共用)

Next.js 16 (App Router, route groups `(site)`/`(admin)`, `[locale]`) · React 19 · TS ·
Tailwind v4 · Supabase · Anthropic SDK · Resend · Vitest. Package manager: **npm only**
(`package-lock.json` present — never use pnpm/yarn/bun).

## Commands (single source of truth)
- Install:   `npm install`
- Dev:       `npm run dev`   (or the preview MCP — don't hand-spawn a second server)
- Build:     `npm run build`   (fails on TypeScript errors)
- Typecheck: `npm run typecheck`
- Test:      `npm test`   (Vitest, `tests/**` — 78 tests)
- Lint:      `npm run lint`   (ESLint 9 flat config)

## Before starting
- Restate the request + list the files you'll touch in one line, then act.
- Read the relevant files (and both `content/zh-TW` + `content/en`) before editing.

## During implementation
- Change only what the task needs; one focused change at a time.
- `content/` strings must be edited in **both** locales (`zh-TW` and `en`).
- Output zh-TW by default; lead with the conclusion in plain language. No AI 雞湯 / 工整排比.

## Before saying "done" (all green, or it's not done)
- `npm run typecheck` ✅  `npm test` ✅
- If you touched routing/`proxy.ts`/an API route: verify the **real HTTP path** once
  (curl / preview), not just unit tests.

## Forbidden — never do autonomously; ASK first
- Do **not** push to `main` or deploy to prod without explicit confirmation
  (only `main` deploys to prod; branch pushes are preview-only and OK).
- Do **not** edit: `.env*`, `.claude/settings*.json`, `.codex/config.toml`,
  `package-lock.json`, `tsconfig.tsbuildinfo`, `next-env.d.ts`,
  `public/fonts/*.ttf` (generated / secret).
- Do **not** commit secrets/passwords/keys.
- Do **not** send real-user email, run DB migrations, or touch billing — flag, don't do.

## Generated files (tool-owned — don't hand-edit)
`tsconfig.tsbuildinfo`, `next-env.d.ts`, `.next/`, `package-lock.json`,
`public/fonts/*.ttf` (subset via scripts). `proxy.ts` is the Next 16 middleware —
changing the locale-redirect exclusions affects every route; test after.

## Ask vs proceed
- ASK: outward/irreversible actions, expanding task scope, deleting things you didn't
  create, pricing/billing.
- PROCEED: in-scope implementation, reversible local changes, adding tests, fixing bugs.

## Hard product constraints (always true)
- No competition with Sylvera (carbon ratings / carbon markets).
- No greenwashing (漂綠); copy opens with a concrete real scene, not abstract slogans.
