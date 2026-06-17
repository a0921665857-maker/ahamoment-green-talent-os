# START HERE — final, conversion-optimized version

This is the version to run. It supersedes the earlier zips and scattered prompts.
Three parts: (1) the conversion-optimized final, (2) exactly how to run it, (3) two prompts to
paste into Claude Code.

Read order for the agent: `docs/PROJECT_STATE.md` → `docs/OPTIMIZATION_V1.1.md` → this file.

---

## 1. The conversion-optimized final (and why each choice lifts willingness-to-pay)

**Lead with the cheapest "yes".** The paid funnel leads with the two lowest-risk services —
Deep Read (cheapest commitment) and the 90-minute Teardown (risk-reversed human entry). High-tier
sprints/packages are shown ONLY to matched, triggered users, never as the default CTA. A buyer's
first "yes" is the hardest; make it small.

**Price for volume of yeses first, margin later.** Deep Read starts at the low end
(NT$1,500 / US$49). Teardown NT$6,800 / US$249 with a fair guarantee (if the session surfaces
nothing useful, it's free; the fee credits 100% toward anything bigger). High tiers sit deliberately
below the global MBA-consulting market (single-school packages there run US$7,300+), so you read as
"specialist but accessible" with room to raise later.

**Convert at the moment of peak emotion — right after the report.** The CTA sits immediately after
"recommended next move," and reads: name the gap → name why doing it alone stalls → offer ONE clear
next step. Not a sales pivot; the natural continuation of the diagnosis.

**Honest levers only — no dark patterns.** No fake countdowns, no false scarcity, no manufactured
urgency. They would burn a sophisticated audience and break the brand. Use real risk reversal, real
trigger-based urgency (their actual MBA-cycle / transition deadline), and genuine proof via a strong
public sample report. With this audience, honest conversion is also the most effective conversion.

**UX for conversion.** Default the intake to the LOWEST-friction input (paste notes / LinkedIn), not
CV-PDF — the upload step is the biggest drop-off. Flawless on mobile (the audience is on Threads/
phone). Fast (Haiku extraction cuts the wait). Keep the confirmation page (trust beats the extra
step). Put the sample report in front of the email gate as proof.

**Capture the non-buyers.** Email + the D0/D2/D6 follow-up. The D2 "one more observation" email
re-opens the gap with new specific value and re-presents the offer — that is where much of the
conversion tail lives.

(During the free beta, before EP/legal: prices are SHOWN to test willingness-to-pay, but the
"purchase" is intent-capture / a booked call / a reserved Deep Read slot, transacted manually.)

---

## 2. Run it (≈ one focused weekend to a live beta)

- **Phase 0 — prepare (~15–20 min, you).** Node 20+ (`node -v`), VS Code; accounts (Anthropic ✓,
  Supabase, Vercel, GitHub); unzip this folder.
- **Phase 1 — run the built app locally (~1.5–2 hr).** Open the folder in Claude Code; paste Prompt 1.
- **Phase 2 — conversion changes + architecture hardening (~3–5 hr).** Paste Prompt 2; time-boxed,
  checkpointed, tests green at each step.
- **Phase 3 — quality + deploy (~2–3 hr).** `npm run seed -- --full` (read the zh-TW reports), tune,
  push to private GitHub, import to Vercel + set env, set an Anthropic spend alert.
- **Phase 4 — launch + validate (~2–3 weeks calendar, you).** 15–20 warm leads; measure finish /
  resonance / paid-or-strong-intent; EP/legal in parallel — required before charging, not before the
  free beta.

The code runs as-is for the existing flow after Phase 1; Phase 2 layers the conversion polish and the
hardening. You are never blocked.

---

## 3. Paste into Claude Code

### Prompt 1 — get it running
```
你是這個專案的工程夥伴。先讀 docs/PROJECT_STATE.md 和 docs/START_HERE.md。這是一個已經建好的 Next.js 16 + TypeScript + Tailwind + Supabase 雙語產品。
帶我完成「在本機跑起來」：
1) npm install。
2) 一步步指導我建 Supabase 專案，把 supabase/schema.sql 貼進 SQL Editor 執行，確認 9 張表與 source-materials private bucket。
3) 用 .env.example 建 .env.local，逐一說明每個變數哪裡拿（Anthropic key、Supabase 三個值、自訂 ADMIN_PASSWORD、用 openssl rand -hex 32 產生 ADMIN_SESSION_SECRET）；Calendly/Stripe/網址/隱私 email 先留 placeholder。
4) npm run dev，請我走一次中文、一次英文流程，並在 /admin/login 登入確認。
每步先說你要做什麼、需要我給什麼，出錯就停下來一起修，不要一次跑完。全程繁體中文。
```

### Prompt 2 — conversion changes + architecture hardening (after Phase 1 works)
```
讀 docs/OPTIMIZATION_V1.1.md 和 docs/START_HERE.md。照「conversion-optimized final」實作，遵守最小化、time-box、不過度開發；先給我「要改哪些檔案＋每項預估時間」的清單，我同意後再動；每個 checkpoint 保持 npm test 與 npm run build 綠。

轉換優化（文案一律改在 content/，不要寫死在元件）：
1) 把填寫流程預設分頁改成「最低摩擦」的貼上（筆記或 LinkedIn），不要預設 CV PDF。
2) 報告頁的付費區只突出「一個」推薦的下一步，其餘做成安靜的次要選項；CTA 文案順序＝點名缺口→為何自己做會卡→一個明確下一步。
3) Deep Read 設成「表達意願/預約」的 intent-capture，起價 NT$1,500 / US$49；teardown 加「公平保證」文案（沒戳到有用的東西就免費、費用全額折抵）。
4) 公開 sample report 頁要顯眼，並在 email gate 之前出現一次當作信任證明。
5) landing 與 offer 文案加入「誠實的觸發式急迫」（點名 MBA 申請季/轉職死線），不要假倒數、不要假稀缺。
6) 可分享的「綠色職涯類型」卡片：給分享者面子的正向標籤，附一個柔性的「來測你自己的」CTA。

架構硬化（部署前必做）：
7) 把報告生成從 /api/mri/answers 的阻塞請求拆出來：answers 只做評分＋分類＋寫入＋觸發報告生成，結果頁改輪詢 reports 狀態後再顯示，避免 serverless timeout。
8) lib/prompts/profile_extraction 的 model 改用 MODELS.cheap（Haiku）。
9) 新增「全站每日 MRI 上限」kill switch（用一張 daily_counters 表或 events 計數，超過回友善錯誤）。
10) 把 lib/rateLimit 套到 /api/admin/login。

做完把第 1 節的定價與服務寫成 docs/PRICING.md，並更新 docs/PROJECT_STATE.md、NEXT_ACTIONS.md、CHANGELOG.md。全程繁體中文。
```

---

## 4. Honest note
The build is done and good. Everything above is still an assumption until ~15–20 real people hit it.
Further optimization has diminishing returns versus launching. Ship it this weekend; let real
willingness-to-pay tell you what comes next.
