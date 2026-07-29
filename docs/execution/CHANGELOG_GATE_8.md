# CHANGELOG_GATE_8

> 2026-07-30 · branch `claude/gate-8-autonomous-execution` → 已合併進本機 `main`（未 push，見 NEXT_MORNING 第二節）

## WP-0 · 文件治理 — `18c413d`

- 新增 `docs/product/CURRENT_PRODUCT_STRATEGY.md`：唯一正典。含定位、三個決策時刻、免費組合、兩檔付費服務與價格、90 天不做清單，以及**單獨標示的五個未驗證市場假設**。
- 六份文件加上 SUPERSEDED 橫幅（START_HERE、HANDOFF_TO_CLAUDE_CODE、NEXT_ACTIONS、PROJECT_STATE、build-plan、ROADMAP），寫明被什麼取代、為什麼。保留不刪：它們是定價演變的紀錄。
- `AGENTS.md` 新增「商業模式常數」一節（每個 agent session 實際會讀的就是這一份），寫明收費資格已確認、不要再加法律閘門，並點名已死的提案。
- 修正 `AGENTS.md` 過期的「78 tests」。

## WP-1 · 服務與定價 — `d8de4ce`

- 新增 `lib/services.ts`：**公開價格的唯一來源**。公開服務的 `OfferCopy.price` 刻意留空，測試強制。
- 兩檔付費服務：`offer_path_read`、`mba_story_teardown`，依頁面語言 NT$6,800／SGD 420。
- 免費 30 分鐘更名為「30 分鐘定位對談」，產品說明包含「會告訴你要多少錢」。
- 十檔舊 offer 封存：留在 `OFFER_IDS` 供歷史資料解析，永不出現在公開頁面。三檔多週陪跑永久移除。
- `offersFor()` 移除 overlay 表；`ctaOffers()` 改回傳兩格，遇到已封存的舊分類自動退回現行目錄。
- 每張服務卡新增「這個服務不做什麼」。
- 移除全額退費保證與 30 天折抵政策（兩個語系）。
- 任何 CTA 都不會渲染成 `#`：預約網址未設就不畫按鈕，保留必定存在的 LINE 出口。

## WP-2 · 付款 — `05715a7`

- 新增 `lib/stripeWebhook.ts`（無 SDK）：`Stripe-Signature` HMAC-SHA256 驗證、常數時間比對、多個 v1 候選、時戳容忍窗擋重放。
- 新增 `/api/webhooks/stripe`：`STRIPE_WEBHOOK_SECRET` 未設回 503；`livemode:false` 除非 `STRIPE_ALLOW_TEST_MODE='true'` 一律丟棄；非 `paid` 忽略；以 checkout id 去重。
- `payment_succeeded` 列為 server-only：在 `EVENT_NAMES` 內，但公開事件端點明確拒絕。
- 金額只寫進第一方 `events` 表，不進 PostHog。
- 新增 `/[locale]/payment/success` 與 `/[locale]/payment/cancelled`（皆 noindex）。
- `robots.ts` 新增 disallow `/payment/` 與 `/twin/`。
- 新增 `docs/execution/STRIPE_SETUP.md`。

## WP-3 · 量測 — `3860d6c`

- `mri_started` 從掛載即觸發改為**第一次真實互動**（切分頁／打字／選檔／勾同意／開快速版），一次 mount 只發一次，帶 `trigger`。
- 判斷力題庫從零埋點變成五個事件（頁面、分頁、每題作答、完成、捲動深度）。作答理由文字永不外傳。
- 長頁捲動深度 25/50/75/90% ＋ 裝置分類。
- 服務頁從零埋點變成瀏覽、每個服務的 CTA、checkout 意圖。
- 移除兩個死事件名 `page_view`、`language_selected`（全 repo 零呼叫點）。
- `jd_translate_submitted` 納入正式 taxonomy。
- 新增 `docs/analytics/EVENT_DICTIONARY.md`，含四項已知量測限制。

## WP-4 · 全站路網 — `416d5ce`

- 新增 `SiteHeader`（三個決策入口）與 `SiteFooter`（全站索引），放進 site group layout；19 頁各自手寫的 nav 全部移除。
- 桌機 LINE 路徑：可複製的 Official Account ID ＋ 操作說明（`lin.ee` 深連結在電腦上是死的）。QR 圖可由 `NEXT_PUBLIC_LINE_QR_PATH` 選配，不編造圖片網址。
- Skip link ＋ 每頁 `id="main"`。
- 回訪報告連結從首頁 nav 移進共用 header（現在每一頁都回得去）；判斷力的返回連結移進文章內，沒有隨 nav 消失。

## WP-5 · 隱私與資料生命週期 — `e46b8fb`

- 新增 `lib/purge.ts` ＋ `/api/cron/purge`（每日 03:00 UTC）。**預設 dry run**，`PURGE_ENABLED='true'` 才寫入，`?dry=1` 永遠強制預覽，分批更新。
- 新增 migration `20260730_purge_index.sql`（新增型 partial index，rollback 寫在檔案裡）。
- 隱私頁新增三節：第三方處理者與跨境傳輸、cookie 與行為分析、付款資料。
- 同意區新增「誰會看到」：Michael 本人，沒有第三個人。
- 測試強制隱私頁必須逐一提到六家處理者，未來的文案編輯若悄悄刪掉一家會失敗。

## WP-6 · 揭薪指數 — `5108acd`

- 與 ledger 對帳：**3 個格子達 n≥5，不是文件先前寫的 5 個**，且全在新加坡。98 筆觀測、97 筆 posted、26 筆年資不明（不進格）、72 筆在格內、22 個格子。
- 新增 `/[locale]/salary-index`：列出全部 22 個格子，19 個沒有數字的顯示「還差 N 筆」而不是消失。
- 頁面自陳新加坡偏斜與其成因；沒有台灣欄，並寫出理由（36% 面議）。
- verification 狀態是一等公民，全部標 `source_available_unverified`——沒有複驗就不宣稱已稽核。
- `/salary-index` 與先前成為孤兒的 `/types` 索引頁加入 sitemap。

## WP-7 · 營運材料 — `0e15ab6`

新增 `ops/` 六份文件：再接觸稿（六個版本，含價格）、見證邀請稿、通話紀錄範本、90 天記分板（V1–V7）、會前問卷、諮詢後備忘錄範本。`ops/validation/records/` 加入 `.gitignore`。

---

## 沒有做的事（刻意）

- 沒有寄出任何訊息、沒有聯絡任何使用者、沒有預約任何會議。
- 沒有偽造見證、付款、成交或需求驗證結果。
- 沒有跑任何破壞性 migration，沒有刪除任何 production 資料。
- 沒有讀取或寫入任何 `.env` 檔。
- 沒有動首頁的敘事結構（見 FOUNDER_DECISIONS #4）。
- 沒有 push `main`（machine hook 阻擋，未繞過）。
- 沒有把使用者原本未提交的四個內容線檔案提交進任何 commit。
