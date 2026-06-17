# 產品優化圖（PRODUCT_OPTIMIZATION_ROADMAP）

> 版本 v1 · 2026-06-14 · 全程繁體中文
> 本文件是「轉換優化 + 入門產品階梯 + 台幣化 + 誠實限時 CTA」的完整可執行排程。
> 每一項都標註：改哪個檔案、工程量、風險、測試影響。動工時逐階段照做即可。
>
> **執行進度**：
> - 階段 0、1、2、3 ✅ 完成並驗證。
> - 階段 4：4.1 預設貼上分頁 ✅；4.2 公開 sample report、4.3 可分享類型卡、4.4 深度觸發文案 ⏳ 待辦（淨新功能／創辦人語氣文案，建議專注回合處理）。
> - 階段 5：5.8 抽取改 Haiku ✅（seed 實測 2/2）、5.9 每日上限 kill switch ✅、5.10 admin 登入限流 ✅；★ 報告非阻塞 ⏳ 留待部署前專注回合。
> - 階段 6 ⏳ 待辦。
> - 額外修復：`.env.local` 的 `ADMIN_PASSWORD` 含 `#` 被 dotenv 截斷，已加引號修正（見 env-hash-quoting 記憶）。

---

## 0. 已鎖定的決策（binding）

| 決策 | 結論 |
|------|------|
| 幣別 | **中文版顯示 NT$、英文版顯示 US$**（英文受眾多為國際申請者） |
| 執行方式 | 先完成完整規劃（本文件），再逐階段動工 |
| 誠實槓桿 | 只用真死線／真名額／真風險反轉。**禁止假倒數、假稀缺**（START_HERE 明訂） |
| Beta 收款 | 手動成交（轉帳／Line Pay／街口）；Stripe／金流串接延後 |

---

## 1. 策略框架（為什麼這樣排）

整個 beta 的唯一目標：**用誠實手段把「願意付錢的 yes」最大化**，用 15–20 個真實使用者驗證付費意願。

審視現有程式碼後，最大的轉換漏洞是：

> 目前最便宜的付費方案是 90 分鐘拆解（US$249 ≈ NT$8,000）。
> **中間沒有任何低門檻入口**——買家的第一個 yes 最難跨，門檻卻設在 NT$8,000。

四個槓桿，貫穿所有優化：
1. **降低第一個 yes**（免費聊聊 + Deep Read NT$1,500）
2. **在情緒高點轉換**（報告剛產出時，只突出一個下一步）
3. **捕捉非買家**（D0/D2/D6 跟進信）
4. **全程誠實**（真死線、強風險反轉、公開 sample report）

---

## 2. 信任階梯（Ladder of Yeses）— 建議定價

由下往上＝承諾與價格遞增。台幣為主，英文版括號美金。

| 層級 | 方案 | 角色 | 中文定價 | 英文定價 | 對照舊價 |
|------|------|------|----------|----------|----------|
| 0 | 免費 30 分鐘聊聊 | 免費入口 | 免費 | Free | （新增） |
| 1 | 深度書面解讀 Deep Read | 最便宜的 yes | **NT$1,500** | US$49 | （新增） |
| 2 | 1 小時診斷諮詢 | 低風險真人入口 | **NT$2,800** | US$89 | （新增） |
| 3 | 90 分鐘故事拆解 · 含公平保證 | 真人入口 | **NT$3,800** | US$129 | ↓ US$249 |
| 4 | CV／LinkedIn 審閱 | 情境加購 | **NT$3,800** | US$129 | ↓ US$249 |
| 5 | AI＋真人模擬面試組 | 情境加購 | **NT$4,800 起** | US$159+ | ↓ US$300–800 |
| 6 | 氣候職涯定位衝刺 | 進階 | **NT$12,000 起** | US$390+ | ↓ US$800–1,500 |
| 7 | 單校 MBA 故事衝刺 | 進階 | **NT$18,000 起** | US$590+ | ↓ US$1,200–2,000 |
| 8 | 綠色職涯／MBA 完整方案 | 完整陪跑 anchor | **NT$48,000 起** | US$1,560+ | ↓ US$3,000–5,000 |

> 註：價格為建議起點，可在 `paidOffers.ts` 自由微調。Deep Read NT$1,500 對齊 START_HERE 原始設定。
> 公平保證（層級 3）：沒戳到有用的東西就免費、費用 30 天內全額折抵任何更大方案——沿用現有 `creditPolicy`。

---

## 3. 六階段排程總表

| 階段 | 內容 | 主要檔案 | 工程量 | 風險 |
|------|------|----------|--------|------|
| 0 設定為你的 | Calendly 換成你的帳號 | `.env.local`（→ Vercel env） | ~10 分 | 零 |
| 1 幣別＋降價 | US$→NT$／US$ 雙語、價格下修 | `content/{zh-TW,en}/paidOffers.ts` | ~1–2 hr | 零 |
| 2 入門產品階梯 ★ | 新增免費聊聊／Deep Read／1hr 諮詢 | `lib/constants.ts`＋content＋`resultClassifier.ts`＋tests | ~4–6 hr | 中 |
| 3 誠實限時 CTA | 「X 號前折價」促銷條（真死線） | content `promo`＋landing／報告頁 | ~2–3 hr | 低 |
| 4 轉換打磨 | 預設貼上、公開 sample、分享卡、觸發式急迫 | content＋數個元件 | ~3–5 hr | 低 |
| 5 架構硬化 | 報告非阻塞、Haiku、每日上限、admin rate limit | API 路由 | ~3–5 hr | 中 |
| 6 捕捉＋收款 | D0/D2/D6 跟進信、台灣收款 | content emails＋手動流程 | ~3–5 hr | 低 |

★ = 對轉換影響最大的一步。

---

## 4. 各階段細節（含檔案級說明）

### 階段 0 — Calendly 換成你的帳號
- 改 `.env.local` 的 `NEXT_PUBLIC_CALENDLY_URL`（部署時同步改 Vercel env）。
- 報告頁「預約時段」按鈕在 `components/PaidOfferCta.tsx`，讀的就是這個變數，改完即生效。
- 需要你提供：你的 Calendly 連結。

### 階段 1 — 幣別＋降價（純文案，零風險）
- 價格是純字串，只改 `content/zh-TW/paidOffers.ts`（NT$）與 `content/en/paidOffers.ts`（US$）的 `price` 欄位。
- 依第 2 節定價表更新；其餘文案（blurb／delivery／forWhom）順手潤一下。
- 無型別變更、無測試影響。

### 階段 2 — 入門產品階梯（最關鍵，動到型別）
1. `lib/constants.ts`：在 `OFFER_IDS` 增加 `intro_call_free`、`deep_read`、`consult_60`。
2. `content/schema.ts`：`PaidOffersContent.offers` 是以 `OfferId` 為鍵，新增鍵會被型別強制要求補內容（這是刻意的安全網）。
3. `content/{en,zh-TW}/paidOffers.ts`：補三個新方案內容。
4. `lib/scoring/resultClassifier.ts`：
   - `ctaOffers()` 改成**只突出一個推薦下一步**（primary），免費聊聊／Deep Read 作為安靜的次要入口（entry），完整方案維持 anchor。
   - `offersFor()` 視類別把低風險入口接上（例如 `profile_building_needed` 的 primary 改成免費聊聊或 Deep Read，最符合「先別急著賣」）。
5. `tests/`：更新受影響的 golden 測試，保持 `npm test` 綠燈。
6. 驗收：`npm run typecheck && npm test && npm run build` 全綠。

### 階段 3 — 誠實限時 CTA
- 在 content 新增 `promo` 物件：`{ active, deadlineISO, headline, discountLabel, appliesTo }`，死線用真實日期。
- 顯示在 landing hero 與報告 CTA：例如「Beta 創始名額：6/30 前預約 Deep Read 折 NT$500」。
- **鐵律**：`now > deadline` 時自動隱藏並回復原價（程式判斷，確保不說謊）。名額若標數字，要真的限量。
- 不做假倒數計時器、不做假「只剩 N 位」。

### 階段 4 — 轉換打磨（對應 START_HERE Prompt 2 第 1–6）
1. 填寫流程預設分頁改「貼上筆記／LinkedIn」（最低摩擦），不要預設 CV PDF。
2. 報告付費區只突出一個推薦下一步（與階段 2 一致），其餘做安靜次要選項。
3. 公開 sample report 頁，並在 email gate 之前出現一次當信任證明。
4. 可分享的「綠色職涯類型」卡片：正向標籤＋柔性「來測你自己的」CTA。
5. landing／offer 加入觸發式急迫（點名 MBA 申請季／轉職死線），同樣禁假倒數。
6. 文案一律改在 `content/`，不要寫死在元件。

### 階段 5 — 架構硬化（部署前必做）
- ★ **報告生成改非阻塞**：實測 `/api/mri/answers` 阻塞約 90 秒，部署到 Vercel 會踩 serverless timeout。改成：answers 只做評分＋分類＋寫入＋觸發報告生成，結果頁改輪詢 `reports` 狀態後顯示。
- `lib/prompts/profile_extraction` 的 `model` 改 `MODELS.cheap`（Haiku），降成本。
- 新增「全站每日 MRI 上限」kill switch（daily_counters 表或 events 計數，超過回友善錯誤）。
- 把 `lib/rateLimit` 套到 `/api/admin/login`。

### 階段 6 — 捕捉非買家＋收款
- D0/D2/D6 跟進信（V1 手動寄）；D2「再多一個觀察」重開缺口、重述 offer——轉換長尾多在此。文案放 `content/{locale}/emails.ts`。
- 台灣收款：beta 用手動（轉帳／Line Pay／街口）；正式金流再接綠界／藍新或 Stripe TWD。`NEXT_PUBLIC_STRIPE_LINK_*` 維持 placeholder。

---

## 5. 建議執行順序

1. **現在就做（零風險、解決兩個明確需求）**：階段 0 + 1 — 換 Calendly、全面台幣化＋降價。
2. **最大轉換槓桿**：階段 2 入門階梯。
3. **部署前一定要做**：階段 5 報告非阻塞。
4. 其餘（3、4、6）依時間插入。

每個 checkpoint 守住 `npm test` 與 `npm run build` 綠燈；完成後更新 `docs/PRICING.md`、`PROJECT_STATE.md`、`NEXT_ACTIONS.md`、`CHANGELOG.md`。

---

## 5b. v2 再次排序（2026-06-14 · 結合 INSEAD 差異化、服務擴充、付款）

### 已完成（本輪）
- ✅ **免費報告大幅加深**：`lib/prompts/mri_report.ts` 改 v2——6 個核心診斷段落字數上限拉高（zh 約 280–420 字／en 150–220 字），要求講出「機制／為什麼」，並以 Blue Ocean「無爭之地」、六秒感知等 INSEAD 框架當分析透鏡。zh-TW seed 實測：報告精準引用對方原話、讀來「被讀懂」。硬排除（不給付費交付物）完整保留。maxTokens 6000→9000。
- ✅ **新增 2 個 INSEAD 差異化服務**：`offer_negotiation`（綠領 Offer/薪資談判，七要素框架，NT$4,800）、`climate_finance_transition`（氣候金融/影響力投資轉職衝刺，NT$15,000 起）。

### 服務選單（完整，含既有＋新增）
| 服務 | 對應 INSEAD 差異化 | 中文價 |
|------|------------------|--------|
| 免費 30 分鐘聊聊 | — | 免費 |
| Deep Read 深度書面解讀 | Customer Insights | NT$1,500 |
| 1 小時診斷諮詢 | — | NT$2,800 |
| 90 分鐘故事拆解 | Strategic Communication | NT$3,800 |
| CV／LinkedIn 審閱 | The Art of Communication | NT$3,800 |
| **綠領 Offer/薪資談判**（新） | Negotiating Your Career／Negotiations | NT$4,800 |
| AI＋真人模擬面試組 | ACL | NT$4,800 起 |
| 氣候定位衝刺 | Blue Ocean ERRC／Strategy for Impact | NT$12,000 起 |
| **氣候金融轉職衝刺**（新） | Sustainable Finance／Project Finance／Strategy & Investing for Impact | NT$15,000 起 |
| 單校 MBA 故事衝刺 | — | NT$18,000 起 |
| 完整方案 | 全部 | NT$48,000 起 |

待提案（未實作）：創業者定位／商業模式診斷（New Business Ventures + BMC）、LinkedIn 影響力/內容策略（Marketing to Humans）。

### 再次排序的待辦（依槓桿/風險）
| 優先 | 項目 | 狀態 |
|------|------|------|
| P1 | 公開 sample report 頁（v2 深度報告當範例）＋ landing 連結＋email gate 前出現 | ✅ `/[locale]/sample` |
| P1 | 服務選單頁（11 個服務全顯示，含 2 新服務）＋ landing 連結 | ✅ `/[locale]/services` |
| P2 | 可分享的綠色職涯類型卡（8 類別正向標籤＋Web Share/複製＋柔性 CTA） | ✅ 報告頁＋範例頁 |
| P2 | 報告非阻塞（部署前必做、風險中） | ✅ answers 改 `after()` 背景跑、結果頁 `ReportPending` 輪詢；async e2e 實測 answers 2.4s 回傳、報告 97s 後就緒 12 段 |
| P3 | D0/D2/D6 跟進信 | ◐ 模板已存在 `content/*/emails.ts`，V1 手動寄；自動個人化草稿為未來增強 |
| P3 | 觸發式急迫深化文案 | ✅ landing 加誠實觸發句（`offersTeaser.honestUrgency`，可自行改語氣）；促銷橫幅另有死線急迫 |

### 報告非阻塞——新增/改動檔案
- `app/api/mri/answers/route.ts`：評分＋報告＋admin 摘要移入 `after()`，answers 立即回 `{status:'generating'}`；pipeline 失敗則 session 設 `failed`。
- `app/api/mri/report-status/route.ts`（新）：輪詢端點，回 `{ ready, failed }`。
- `components/ReportPending.tsx`（新）：結果頁未就緒時輪詢、就緒後 `router.refresh()`、失敗顯示友善訊息。
- `lib/reportData.ts`：加 `getSessionStatusByToken`；result 頁加 `force-dynamic`。
- 注意：v2 深度報告較長，生成約 90–100s（< `maxDuration` 180s）；若未來逼近上限再考慮拆段或調高。

### 付款方式（怎麼做）
- **Beta 現階段（尚無 EP/公司）**：照 START_HERE，CTA＝Calendly 預約，款項**手動收**（銀行轉帳／Line Pay／街口）。零串接、零程式。報告頁「預約時段」已指向你的 Calendly。
- **要線上刷卡時**（需公司/統編）：
  - **Stripe Payment Links**——支援 TWD/USD，產生連結即可，最適合國際（美金）買家；把連結貼進 `.env.local` 的 `NEXT_PUBLIC_STRIPE_LINK_*`，我再把 offer 按鈕接上去。
  - **綠界 ECPay／藍新 NewebPay**——台灣最常見，支援信用卡/ATM/超商/Line Pay，有 hosted 付款頁可產連結，少量串接。
  - 流程：先註冊公司取得統編 → 開金流帳號 → 產生各方案付款連結 → 填入 env → 我把 `PaidOfferCta` 的按鈕從「預約」切到「付款」。

---

## 5c. 第一印象優化（PM／GTM／UI-UX × INSEAD 框架）

目標：第一眼「被吸住」而非困惑流失。已實作於 landing：

| 視角 | 問題 | 改動 | INSEAD 依據 |
|------|------|------|------------|
| PM | 標題抽象，看不出對「我」的價值 | hero 改成點名痛點的鉤子：「你不缺經歷，缺的是讓人一眼讀懂的定位」 | Customer Insights：先講顧客的問題，不是產品功能 |
| GTM | 看起來像「又一個職涯顧問」→ 懷疑而流失 | 新增差異化區塊（高位）：不是通用 MBA 顧問／不是雞湯／不代寫 | Blue Ocean：明確畫出類別邊界（ERRC） |
| UI-UX | 信任與證明都埋在頁尾，要先付出努力才看得到價值 | hero 加可信度行（INSEAD×四大 ESG）＋次要「先看範例」CTA，價值/證明前置 | 心理：權威、價值前置、降低承諾門檻 |
| 心理 | 沒有「不做的代價」framing | 誠實急迫句點名 MBA 申請季/轉職真實死線（非假倒數） | Pricing P4C：心理帳戶／WTP——價值與時機驅動付費意願 |

定價已採價值定價（WTP 導向）＋階梯錨定（免費→NT$1,500→NT$48,000），符合 P4C 的價值定價與心理帳戶原則。
所有文案在 `content/`，可自行改成你的語氣（hero.title/credibilityLine、differentiator、offersTeaser.honestUrgency）。

---

## 6. 已知技術前提（先前修復）

- 抽取路由原本因 LLM 輸出結構漂移而失敗；已改用 Anthropic tool use（結構化輸出）強制符合 schema，`lib/anthropic.ts` 的 `callPrompt` 已重寫，真實履歷實測 4/4 通過、64 單元測試全綠。
