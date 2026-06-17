# HANDOFF — run this with Claude Code

Goal: get the built app running on your machine, implement the V1.1 changes minimally and
time-boxed, deploy a free beta, then go validate. Hand this to **Claude Code** (terminal or the
desktop app's agent) with the project folder open. The plain Claude chat app cannot run `npm` or
edit files in a repo — Claude Code can.

Read order for the agent: `docs/PROJECT_STATE.md` → `docs/OPTIMIZATION_V1.1.md` → this file.

Necessary files you provide:
- The repo folder (this zip, unzipped) — contains all code + docs + `supabase/schema.sql` + `.env.example`.
- `.env.local` — you create it in Phase 1 from `.env.example`.
- A Supabase project with `supabase/schema.sql` run in it (Phase 1).

---

## Phase 0 — prepare (~15–20 min, you)
1. Install Node.js 20+ (`node -v` to check; nodejs.org LTS if missing).
2. Install VS Code (you'll edit zh-TW copy).
3. Accounts (all free tiers): Anthropic (you have it), Supabase, Vercel, GitHub.
4. Unzip the repo; note its path.

## Phase 1 — run the built version locally (~1.5–2 hr)
Open the folder in Claude Code and paste **Prompt A** (below). It will: `npm install`; walk you
through creating a Supabase project and running `supabase/schema.sql`; help you create `.env.local`;
start `npm run dev`; and check one EN and one zh-TW flow end to end.
Minimum env to fill: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

## Phase 2 — implement V1.1, minimally + time-boxed (~3–5 hr)
Paste **Prompt B**. It implements only the high-leverage, cheap changes from OPTIMIZATION_V1.1.md
and stops at each checkpoint for your review. Hard rule for the agent: time-box; do not add anything
not in the V1.1 spec; keep `npm test` + `npm run build` green at every checkpoint.

## Phase 3 — quality pass + deploy (~2–3 hr)
1. `ANTHROPIC_API_KEY=... npm run seed -- --full` → read all 8 reports, especially zh-TW. Tune
   `lib/scoring/rubrics.ts` / `content/zh-TW/*` if needed; rerun `npm test`.
2. Push to a private GitHub repo; import into Vercel; set all env vars (add `NEXT_PUBLIC_SITE_URL`).
3. Deploy; smoke-test the live flow; set an Anthropic spend alert.

## Phase 4 — validate (≈2–3 weeks calendar, not full-time, you)
Sell to 15–20 warm leads (Ahamoment / Threads / network). Measure completion, resonance,
willingness-to-pay. Do EP/legal in parallel — required before charging real money, not before the
free beta. Hit your pre-set kill/pivot threshold honestly.

---

## Time to a live, optimized free beta
- One focused weekend (~8–12 hours of actual work), or spread across ~1 week of evenings.
- Then validation runs ~2–3 weeks of calendar time at a few hours/week.

---

## Prompt A — get it running (paste into Claude Code)
```
你是這個專案的工程夥伴。先讀 docs/PROJECT_STATE.md 和 docs/HANDOFF_TO_CLAUDE_CODE.md，理解這是一個已經建好的 Next.js 16 + TypeScript + Tailwind + Supabase 的雙語產品。

請帶我完成「在本機跑起來」：
1. 跑 npm install。
2. 一步一步指導我建立 Supabase 專案，並把 supabase/schema.sql 貼到它的 SQL Editor 執行；確認 9 張表與 source-materials private bucket 都建好。
3. 幫我用 .env.example 建立 .env.local，逐一說明每個變數從哪裡取得（Anthropic key、Supabase 三個值、我自訂的 ADMIN_PASSWORD、用 openssl rand -hex 32 產生的 ADMIN_SESSION_SECRET）；Calendly/Stripe/網址/隱私 email 先留 placeholder。
4. 跑 npm run dev，請我在瀏覽器走一次中文、一次英文的完整流程，並在後台 /admin/login 用我設的密碼登入確認。
每一步先告訴我你要做什麼、需要我提供什麼，遇到錯誤就停下來一起修，不要一次跑完。全程用繁體中文跟我溝通。
```

## Prompt B — implement V1.1 (paste after Phase 1 succeeds)
```
現在讀 docs/OPTIMIZATION_V1.1.md，照「Final converged version (V1.1)」實作，但遵守它最上面的原則：最小化、time-box、不要過度開發。只做以下高槓桿改動，做完一項就停下來讓我 review，並在每個 checkpoint 保持 npm test 與 npm run build 都綠：

1. 重新定位文案：把 landing 與 paidOffers 的 content（content/en 與 content/zh-TW）改成瞄準「有觸發事件的人」（今年要申請 MBA／正在轉職有死線），免費 MRI 仍對所有人開放。所有文案改在 content/ 裡，不要寫死在元件。
2. 新增 Deep Read 中階產品（US$49–99，純 AI 非同步）：先做成「表達購買意願 / 預約」的 intent-capture（不接 Stripe，因為收費要等 EP/法律），CTA 從 Deep Read 往上導到真人 Teardown；在報告頁的付費區呈現這個新階梯。
3. 隱私安全的可分享結果卡：產生一張不含個資、給分享者面子的「綠色職涯定位類型」卡片（正向身分標籤），可下載/分享。
4. 公開 sample report 頁 + 方法透明頁（誠實說明判讀來自資深 ESG/INSEAD 顧問的評分標準，而非真實資料庫）。
5.（若時間允許）90 天回訪 re-MRI 的入口與比較骨架。

做之前先給我一份「你打算改哪些檔案、每項預估多久」的清單，我同意後再動。全程繁體中文。
```

After Phase 2, update `docs/PROJECT_STATE.md`, `docs/NEXT_ACTIONS.md`, and `docs/CHANGELOG.md`.
