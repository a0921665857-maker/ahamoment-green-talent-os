# EVENT_DICTIONARY — 事件字典

> Gate 8 WP-3 · 2026-07-30 · 這份是事件的唯一正典。改事件名之前先改這裡。

## 兩個 sink，用途不同，不要混用

| Sink | 寫入方式 | 用途 | 有沒有 session 綁定 |
|---|---|---|---|
| **第一方 `events` 表**（Supabase） | `recordEvent()`；瀏覽器經 `/api/mri/event`，名稱必須在 `EVENT_NAMES` 白名單裡 | MRI 漏斗的正典。可以 join 回 `mri_sessions`／`reports` | 有（`session_id`） |
| **PostHog** | `phCapture()`（瀏覽器）／`phCaptureServer()`（伺服器） | 產品行為、頁面層級、捲動深度、跨頁導流 | 沒有（匿名 distinct id） |

**規則：**
- 有 session token 的漏斗步驟 → 兩邊都寫（第一方為準）。
- 頁面層級與互動細節（捲動、分頁、題目）→ **只進 PostHog**，因為它們沒有 session token，硬寫進第一方表只會製造一堆 `session_id = null` 的孤兒列。
- **金錢只由伺服器寫。** `payment_succeeded` 在 `EVENT_NAMES` 裡，但 `/api/mri/event` 明確拒絕它（`lib/events.ts` 的 `SERVER_ONLY`）——否則任何人都能 POST 一筆假成交給自己。

---

## 第一方 `events` 表（`EVENT_NAMES`）

| 事件 | 何時觸發 | props |
|---|---|---|
| `mri_started` | **使用者第一次真的動手**（切分頁／開始打字／選檔／勾同意／開快速版） | `locale`, `trigger` |
| `input_method_selected` | 切換輸入分頁 | `input_type` |
| `consent_given` | 勾選必要同意 | — |
| `material_submitted` | 送出素材 | `input_type`, `locale` |
| `extraction_succeeded` / `extraction_failed` | 抽取管線結果 | — |
| `profile_confirmed` | 確認頁送出 | `locale` |
| `questions_submitted` | 補問題＋email 送出 | `locale` |
| `report_generated` | 報告寫入完成 | — |
| `report_viewed` | 報告頁開啟 | — |
| `cta_clicked` | 任何非預約的 CTA | `cta`, `surface`… |
| `booking_clicked` | 點預約連結 | `offer` |
| `checkout_started` | 點付款連結（**意圖，不是成交**） | `offer`, `currency`, `surface` |
| `payment_succeeded` | **只由 Stripe webhook 寫**，簽章驗證後 | `checkout_id`, `currency`, `amount_minor`, `livemode` |
| `newsletter_subscribed` | 訂閱送出 | — |
| `jd_translate_submitted` | JD 送出（意圖） | `locale`, `chars` |
| `jd_translated` | JD 判讀回來（成功） | `locale` |
| `mba_roi_calculated` | ROI 算出結果 | — |
| `save_for_later_submitted` | 留 email 稍後再做 | — |
| `quick_started` / `quick_completed` / `quick_to_full_clicked` | 快速判讀三段 | `locale`, `category` |
| `line_add_clicked` / `line_self_share_clicked` | LINE 兩種動作 | `context` |
| `twin_link_requested` / `twin_link_sent` / `twin_viewed` | 職涯檔案 | — |

### `mri_started` 的變更（重要）

**過去**：元件掛載時就發，等於「/mri 這個網址被打開」。所有以它當分母的轉換率都被低估，2026-07 的漏斗審計必須把這個數字整個作廢。

**現在**：第一次真實互動才發，且一次 mount 只發一次（`startedRef` 擋 StrictMode 雙呼叫）。`trigger` 欄位記錄是哪一種互動。

**後果**：改版後的數字**不能**跟改版前直接比。新舊定義不同，`mri_started` 的絕對數會下降而轉換率會上升——那是量尺變準，不是流量變差。做 before/after 對比時，分母請一律改用 `material_submitted` 或 `questions_submitted`。

---

## PostHog only（不進第一方表）

| 事件 | 何時觸發 | props |
|---|---|---|
| `services_page_viewed` | 服務頁載入 | `locale` |
| `judgment_page_viewed` | 判斷力頁載入 | `locale` |
| `judgment_tab_viewed` | 切換判斷力分頁 | `tab`, `answered` |
| `judgment_answered` | 作答一題（commit-first，不可改） | `rep`, `verdict`, `answered` |
| `judgment_completed` | 12 題全部作答 | `total` |
| `scroll_depth` | 長頁捲到 25/50/75/90% | `surface`, `depth`, `device`, `locale` |
| `payment_success_viewed` | 付款成功頁 | `locale` |
| `payment_cancelled_viewed` | 付款取消頁 | `locale` |
| `payment_succeeded`（伺服器） | Stripe webhook，與第一方同時寫 | `currency`, `payment_status`, `livemode`, `has_report_token` |

判斷力的 props **不含**任何作答理由文字：`verdict` 是三個固定值之一（最佳解／可行但有代價／會出事），`rep` 是題目 id。使用者打的字永遠只留在他自己的瀏覽器。

---

## 絕對不進任何 sink

- 卡號、CVC、任何支付憑證（本站根本不接觸）
- 付款金額 → **只進第一方表**，不進 PostHog
- email、姓名、地址
- 履歷原文、JD 原文、判斷題的自由作答
- session token 以外的任何識別碼

---

## 已知的量測限制（讀數據前先知道）

1. **2026-07-22 的 PostHog silent event loss**：錯的 host 讓 EU key 的事件被靜默丟棄。任何跨這天的 before/after 對比都不乾淨，觀測窗請完全設在 `2026-07-23` 之後。
2. **`report_viewed` 被污染**：它會被跨裝置、清 storage、以及被轉發的報告連結重複計數（自家審計實測 67 人 >> 交素材 24 人）。**不要拿它當任何轉換率的分母**，改用 `questions_submitted`。
3. **LINE 加好友之後站內全盲**：`line_add_clicked` 只記錄「點了外連」。加好友、對話、預約都發生在 LINE 裡，站內沒有回流事件。要量這一段只能看 LINE 官方帳號後台。
4. **分享卡的下游沒有 utm**：`ShareableTypeCard` 的 shareUrl 與 `/types/[category]` 的 CTA 都是裸連結，所以分享**點擊**量得到、分享**成效**量不到。
