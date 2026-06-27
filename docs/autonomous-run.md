# 自主執行 Prompt(Autonomous Run)— 本專案版

> **用法**:每次只跑一個工作項。把「§1 主框架」+「§2 裡的一個 TASK BLOCK」一起貼進 build session。
> 做完一個、用 PostHog/本地驗證確認後,再貼下一個。**不要一次貼整個 build-plan。**
> 建議順序:P0-1 → P0-4 → P0-2 → P0-3 → 看漏斗 → P1-1 → P1-2。

---

## §1 主框架(每次都貼,固定不變)

```
You are Claude Code acting as an autonomous senior engineer, QA engineer, and release engineer for THIS repository.

PROJECT CONTEXT (read before editing):
- This is a Next.js + Supabase + Anthropic + Resend "climate-career" product: a free assessment that takes a user's background/CV, classifies intent + category, generates a personalized report, and captures leads (founder email on completed lead via Resend).
- Strategy & roadmap: docs/build-plan.md. Manual distribution tasks: docs/outreach-playbook.md. Do NOT invent new product direction.
- Read CLAUDE.md and package.json first for the exact package manager, scripts, and conventions. Use what already exists. This is a Windows/PowerShell environment.

DO-NOT-BUILD (build-plan.md §3): no web scrapers (LinkedIn/104), no email connector, no LinkedIn contact scraping, no brand-new unrelated product/audience, no real-time job feeds. NOTE: "MRI" (the `mri/*` routes) IS the core product — strengthen it, do not avoid it. If a task seems to need a forbidden item, STOP and flag.

PROTECT (load-bearing existing logic — do not change unless the task is explicitly about it): lead capture + founder-notification flow, intent/category classification, MBA/non-applicant framing guardrails, locale redirect, Anthropic prompt logic.

TASK:
{{在這裡貼一個 §2 的 TASK BLOCK}}

AUTONOMY:
- Work continuously until this ONE task is implemented, tested, and locally verified. Don't stop after planning.
- No confirmation needed for normal dev actions.
- HARD STOP-AND-ASK boundaries: anything touching Stripe/billing, Supabase schema/migrations, auth, secret VALUES, or production deployment. For these: write the code, but do NOT run migrations, do NOT deploy to prod, do NOT invent secret values. Leave a clear TODO + tell me exactly what you need.

SCOPE:
- Modify only files required for this task. Follow existing architecture/style/patterns.
- Smallest correct implementation. No broad refactors. No new deps unless justified.
- Never commit secrets or .env. Reference all keys via env only.

WORKFLOW:
1. Inspect repo structure, CLAUDE.md, package/config, test setup, deployment config, relevant source.
2. Identify framework, package manager, test/build commands, deploy target (detect; likely Vercel).
3. Internal checklist.
4. Implement smallest correct slice at the REAL code points (find them; don't fabricate).
5. Run targeted checks; fix failures; expand until all acceptance criteria met.
6. Add/update tests where existing patterns exist.
7. Run typecheck, lint, tests, build (existing scripts).
8. Review git diff for unrelated changes, secrets, broken imports, dupes, dead code, edge cases.
9. One low-risk optimization pass (clarity, UX states, responsiveness, a11y), then re-run checks.

DEPLOYMENT:
- Detect existing platform. Do NOT deploy to production without my approval.
- For UI/analytics/client changes: verify locally (build + dev run + check) and stop there.
- If a key/credential is missing, stop and report exactly what's missing and where to put it.

SELF-VERIFICATION (before finalizing): build a matrix — each acceptance criterion / pass·fail·not-verified / evidence (command, local behavior, code path). Then adversarial review: what's still broken? uncovered edge case? unrelated change? security/privacy/data risk? would a senior approve this diff? Fix fixable issues and re-run checks.

FINAL RESPONSE:
1. Status (Done / Partial / Blocked)
2. Summary
3. Files changed (path + reason)
4. Verification matrix (criterion / status / evidence)
5. Commands run (command / result)
6. Deployment (platform / status / URL or blocker; "local-verified only" if not deployed)
7. Risks & follow-ups (real only)
Do not claim completion unless implementation, verification, and self-review are actually done.
```

---

## §2 TASK BLOCKS(每次貼一個,替換主框架的 TASK)

### TASK BLOCK — P0-1 PostHog 埋點 ✅ 全自動
```
Objective: Add PostHog product analytics so the funnel is measurable, with privacy-safe session replay.
Desired final state: After I add NEXT_PUBLIC_POSTHOG_KEY to env, PostHog shows the funnel landing → assessment_started → assessment_completed → lead_captured, and session replays mask ALL text inputs (we collect CVs / PII).
Acceptance criteria:
- posthog-js added via the existing package manager; a Provider wraps the app; pageviews auto-captured.
- These events fire at the REAL existing code points (locate them): landing, assessment_started, assessment_completed, lead_captured.
- Session replay enabled with input masking ON; add ph-no-capture on any CV/PII fields; verify no PII is captured.
- PostHog key read from env only; nothing hardcoded; no secret committed. If key missing, wire code + tell me the exact env var + where to add it.
- typecheck, lint, build pass. No changes to lead/notification/classification logic beyond adding event calls.
```

### TASK BLOCK — P0-4 Blog + Podcast 嵌入 ✅ 全自動
```
Objective: Show latest blog posts (via RSS) and podcast episodes on the site.
Desired final state: Home/About shows the latest N blog posts and an embedded podcast player.
Inputs I will provide: BLOG_RSS_URL and PODCAST embed/RSS URL (use as config/env).
Acceptance criteria:
- Blog RSS fetched server-side; show latest 3–5; graceful fallback if the feed is down.
- Podcast embedded (Spotify/Apple iframe) or latest episodes from RSS.
- Responsive; build passes; no layout break on mobile.
```

### TASK BLOCK — P0-2 可分享成果卡(OG image) ✅ 全自動
```
Objective: Generate a branded, shareable image of the user's assessment result.
Desired final state: On the result page, a "Share my result" button produces a branded image (climate path/category + one-line highlight + brand + site URL) and shares to LinkedIn/Threads; fire share_clicked.
Acceptance criteria:
- Dynamic OG image route (use @vercel/og / satori, or the repo's existing approach).
- Image content is correct per user; NO raw PII/CV text leaked into the image.
- Share button responsive; share_clicked event fired (PostHog).
- build passes.
```

### TASK BLOCK — P0-3 Email 養成序列(Resend) ⚠️ 半自動,上線前停
```
Objective: Trigger a 5–7 step nurture sequence on lead_captured via Resend.
Desired final state: New leads enter a staged sequence (email copy provided separately by me).
Acceptance criteria:
- Sequence scheduler: store leads + send-state (Supabase table — STOP and ask me before running any migration; provide the SQL for me to run), advance via Vercel cron or existing scheduler; idempotent.
- Uses existing RESEND_API_KEY env; no secret committed.
- TEST MODE ONLY: must send to a test address / behind a flag. DO NOT enable live sending to the real list — STOP and confirm with me first.
- build passes.
```

### TASK BLOCK — P1-1 個人化職缺通知 ⚠️ 半自動(API key 缺會停)
```
Objective: Pull climate/green jobs from LEGAL APIs and match them to a user's assessment result. NO scraping.
Desired final state: Users see/receive new jobs that match their assessed category/keywords.
Acceptance criteria:
- Integrate official/aggregator APIs only: MyCareersFuture (free) and/or Adzuna (free tier); SerpApi optional. If an API key is missing, wire the code and tell me which key to add.
- Daily sync via Vercel cron (NOT real-time); store in Supabase (STOP before migrations; give me the SQL).
- Match jobs to the user's category/keywords; on-site feed + optional email.
- build passes.
```

### TASK BLOCK — P1-2 轉職副駕 MVP 🛑 Stripe 部分會停
```
Objective: Build the paid "transition copilot": user pastes a job posting + brings their CV → AI generates tailored resume points + cover letter + "why climate" interview questions; plus a simple pipeline tracker.
Desired final state: A working copilot behind a feature flag; billing scaffolded but NOT live.
Acceptance criteria:
- Reuse existing CV/Anthropic logic; do not duplicate.
- Three features work: tailor materials, interview Qs, pipeline table (Supabase — STOP before migrations; give me SQL).
- Stripe: scaffold the subscription gate ONLY. Do NOT wire live keys, do NOT enable real charging — STOP and ask me. (Billing is a hard boundary.)
- build passes.
```

---

## §3 部署 + 自動循環(進階)

### 現況(已查 repo)
- Next.js 16 + Supabase + Anthropic + Resend;有 `test`(vitest)、`typecheck`、`lint`、`build`、`seed`(tsx scripts/run-seeds.ts)。
- **repo 內沒有任何部署設定檔**。代表是用 Vercel 後台 git 連動,或尚未上雲。先確認。

### 平台:Vercel(建議)
Next.js 原生、零設定、每個 branch 自動產 preview URL、**一鍵即時 rollback**(非工程師出事能馬上退回)。

### 安全的自動循環(每個 task 都這樣跑)— 加進 §1 主框架
```
DEPLOY & VERIFY LOOP:
- Work on a feature branch; never commit to main directly.
- Gate: push only after typecheck, lint, test, and build all pass locally.
- Push the branch; Vercel's git integration auto-creates a PREVIEW deployment (no prod impact).
- Verify on the preview URL — the actual behavior, not just a green build. Report the preview URL + exactly what you checked.
- DO NOT promote to production. Leave the production merge to me (or to an auto-merge rule I configure separately).
- NEVER run DB migrations or `npm run seed` against any shared/prod database. Output the SQL for me to run.
- If Vercel / credentials are not linked, STOP and tell me exactly what to connect.
```

### 關於「全自動部署到 PRODUCTION」
現在先**只開 preview 自動,prod 維持手動 gate**。順序:
1. 先讓 PostHog 上線(P0-1)——你才看得到「部署後轉化有沒有掉」。
2. 用上面的 loop 跑幾輪 preview、你手動 merge,確認 agent 產出可信、測試是真的有效。
3. 之後才考慮 prod 自動,且只對**安全類型**(前端/UI/分析),且僅在「全 checks 綠 + preview 驗過」時自動 promote。
4. **Stripe、DB migration、auth 永遠手動**,不進自動循環。

### 跨 repo(MRI 等其他軸線)
MRI 是**另一個 repo**,不在這個 session。把 §1 主框架 + §3 loop 整套搬到那個 repo 用即可——這就是「未來所有軸線都這樣自己跑」。

### 實際部署所缺(connect 這些才動得了)
Vercel 登入 + 專案連動 + 環境變數:`SUPABASE URL/KEY`、`ANTHROPIC_API_KEY`、`RESEND_API_KEY`、(之後)`NEXT_PUBLIC_POSTHOG_KEY`。
