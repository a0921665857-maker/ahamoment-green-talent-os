# TEST_REPORT — Gate 8

> 2026-07-30 · branch `claude/gate-8-autonomous-execution`（已合併進本機 main，尚未 push）

## 基線 vs 最終

| 檢查 | 動工前 | 最終 | 變化 |
|---|---|---|---|
| `npm run typecheck` | ✅ PASS | ✅ PASS | — |
| `npm test` | ✅ 15 檔 / **165** 測試 | ✅ 19 檔 / **221** 測試 | **+56**，零失敗 |
| `npm run lint` | ⚠️ 1 error + 1 warning | ⚠️ 1 error + 1 warning | **未增加**（同樣兩筆，見下） |
| `npm run build` | ✅ PASS | ✅ PASS | 新增 3 條路由 |

每個工作包完成後都跑過完整四項，全部維持綠燈才提交下一個。

## 既有失敗（動工前就存在，本次未造成、未修）

1. **error** `components/MriIntakeFlow.tsx:118` — `react-hooks/set-state-in-effect`。effect 內同步 `setText()` 還原 localStorage 草稿。**刻意不修**：這是漏斗最關鍵元件，草稿還原保護的是通勤中被打斷的使用者，改動風險高於 lint 潔癖，且與 Gate 8 目標無關。
2. **warning** `components/ProgressStages.tsx:27` — `done` 宣告未使用。同上，不動。

> 驗收判準是「問題數不得增加」。中途曾一度變成 2 error + 3 warning（我造成的：render 內宣告元件、兩個死參數），都在同一個工作包裡修回基線才提交。

## 新增測試（56 筆）

| 檔案 | 筆數 | 守的是什麼 |
|---|---|---|
| `tests/payments.test.ts` | 16 | Stripe 簽章：正確簽章通過、竄改 body 拒絕、錯誤金鑰拒絕、逾時重放拒絕、header 畸形拒絕、多個 v1 候選（金鑰輪替）通過。事件解析只取我們會用的欄位、其他事件型別忽略不報錯、`livemode` 缺省為 false。**分析 payload 不得含金額、checkout id 或 report token**。付款連結守衛（空值／`undefined`／placeholder／非 https／非 Stripe 網域一律拒絕）。`client_reference_id` 會帶、但 `sample` 與 null 不帶。幣別與最小單位金額一致。 |
| `tests/salaryIndex.test.ts` | 8 | n<5 的格子絕不出現數字；有數字的格子區間完整且 hi≥lo；**空格子必須留在資料裡**（空格是產品本身）；對帳快照鎖死 98/97/26/3；目前可公布的格子全在新加坡；沒有任何一列宣稱 `manually_verified`；格子不重複；72＋26＝98 沒有任何一筆被靜默丟掉。 |
| `tests/nav.test.ts` | 10 | 走訪路由樹，header 與 footer 的每一個 href 都必須對應到真的存在的頁面；footer 不得重複；不得出現空 href 或 `#`；兩個語系必須涵蓋同一組路由。 |
| `tests/purge.test.ts` | 11 | 保留期常數等於文案承諾的 90 天；截止日計算正確且不受本機時區影響；**隱私頁必須逐一提到 Vercel／Supabase／Anthropic／Resend／PostHog／Stripe**；必須提到 cookie 與跨境；必須寫明完整卡號不會到本站；必須仍寫出保留天數。 |
| `tests/events.test.ts` | 6 | 事件名不重複；`payment_succeeded` 在白名單內但**公開端點必須拒絕**（否則任何人可以 POST 一筆假成交）；一般漏斗事件仍可從瀏覽器寫；未知名稱拒絕；兩個死名已移除。 |
| `tests/contentSchema.test.ts`（擴充） | +5 | 公開服務的 content 不得有 price 字串（單一來源不變式）；價格必須等於 founder 授權的 NT$6,800／SGD 420；價格不得帶「起／from／+」；**兩個語系都不得再出現全額退費字樣**；兩個服務都必須寫出「不做什麼」與決策時刻。 |
| `tests/resultClassifier.test.ts`（重寫） | ±0 | 兩檔目錄的對應關係；**任何分類、任何時程都不得回傳已封存的 offer**；報告 CTA 最多兩格；遇到 Gate 8 之前存下的舊分類會自動退回現行目錄；八個 golden seed 端到端不得出現封存服務。 |

## 瀏覽器實測（`npm run start`，正式 build）

| 檢查 | 結果 |
|---|---|
| `/zh-TW/services` 渲染 | 兩檔付費服務、NT$6,800、「不做什麼」清單、免費對談在最上面 |
| `/en/services` 價格 | `Free` / `SGD 420` / `SGD 420` |
| 退費字樣 | 兩個語系皆已消失 |
| 死連結（`href="#"`） | 0（services、salary-index、salary-report 三頁實測） |
| 共用 header／footer | 兩者存在，footer 14 條連結 |
| Skip link ＋ `id="main"` | 存在，可聚焦 |
| 手機（375×812） | 桌機 nav 隱藏、漢堡鍵存在、展開後四個入口皆可點、**無水平捲動** |
| `/zh-TW/salary-index` | 3 個市場表、22 列、**恰好 3 列有數字、19 列顯示「還差 N 筆」**、統計卡 98/97/3/26 |
| Console 錯誤 | 無 |

## 未執行的測試（以及為什麼）

1. **真實 Stripe 測試卡結帳** — 沒有 Stripe 憑證。規則明訂不得在缺少 production credentials 時製造假的付款成功，所以這一段停在單元測試層。逐步清單在 `STRIPE_SETUP.md` 第四節，含「按 Resend 重送一次確認去重生效」這一步。
2. **Webhook 端到端** — 同上。簽章驗證邏輯本身有 6 個測試覆蓋，包含竄改與重放。
3. **purge 對真實資料庫執行** — 沒有 production Supabase 憑證，且刪除不可逆。路由預設 dry run，`?dry=1` 永遠強制預覽；建議第一次由你手動打 dry run 端點看它報幾筆。
4. **無障礙自動掃描** — 沒有 axe 之類的工具，且不打算為此裝新依賴。手動確認的部分：skip link、`id="main"`、`aria-expanded`／`aria-controls`、鍵盤 focus 樣式、行動版無水平捲動。`ProgressStages` 沒有 live region 這個既有問題**仍然存在**，未修。
5. **migration 實際套用** — `20260730_purge_index.sql` 是新增型且寫了 rollback，但沒有對 production 資料庫執行。它只建一個 partial index，不改任何欄位。
