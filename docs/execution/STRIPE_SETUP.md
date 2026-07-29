# STRIPE_SETUP — 付款路徑的手動設定步驟

> Gate 8 WP-2 · 2026-07-30
> 程式端已完成並通過測試。這份文件列的是**只有你能在 Stripe 後台做的事**，以及要填進 Vercel 的環境變數名稱。
> 沒有做完這些之前，網站不會少任何功能：付款按鈕只是不出現，預約與 LINE 兩條路照常運作。

## 為什麼是 Payment Links，不是 Checkout API

這個 repo 沒有安裝 `stripe` 套件，而 Gate 8 的授權明訂「現有技術可以完成時，不要安裝新的 package」。Payment Links 是 Stripe 的 hosted 付款頁：卡號、3DS、收據、發票、退款全部在 Stripe 那一側完成，我們這邊只需要兩件事——把人送過去，以及在付款成功時收到一則簽章驗證過的通知。兩件都不需要 SDK。

**直接後果（也是安全上的好處）：本站永遠不會接觸完整卡號、CVC 或任何支付憑證。**

---

## 第一步：在 Stripe 後台建立四個 Payment Link

兩個服務 × 兩個市場。價格必須與 `lib/services.ts` 完全一致——那是網站顯示價格的唯一來源，兩邊對不上就是事故。

| 服務 | 市場 | 幣別 | 金額 | 環境變數 |
|---|---|---|---|---|
| Offer 與路徑判讀 | 台灣 | TWD | 6,800 | `NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_TW` |
| Offer 與路徑判讀 | 新加坡／英文 | SGD | 420 | `NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_INTL` |
| MBA 故事單次拆解 | 台灣 | TWD | 6,800 | `NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_TW` |
| MBA 故事單次拆解 | 新加坡／英文 | SGD | 420 | `NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_INTL` |

每個 link 建立時：

1. 商品名稱用網站上的服務名，買家在收據上看到的就是這個。
2. **「After payment」選「Redirect customers to your website」**，網址填：
   - 台灣（中文）link → `https://<你的網域>/zh-TW/payment/success`
   - 國際（英文）link → `https://<你的網域>/en/payment/success`
   > 這一步只能在後台設定。Payment Link 的成功轉址**不能**用網址參數覆寫，所以程式端沒有、也不該有一個假裝可以的參數。
3. 「Collect customer's address」除非你要開發票，否則不用開——少收一項個資就少一項責任。

`/zh-TW/payment/cancelled` 與 `/en/payment/cancelled` 兩頁已經存在。Payment Links 的「取消」行為是退回上一頁，所以那兩頁目前是給你手動放連結用的（例如信件裡），不需要在後台設定。

## 第二步：Webhook

1. Stripe 後台 → Developers → Webhooks → Add endpoint。
2. 網址：`https://<你的網域>/api/webhooks/stripe`
3. 事件只勾一個：**`checkout.session.completed`**。
4. 建立後複製 **Signing secret**（`whsec_…`），填進 Vercel 的 `STRIPE_WEBHOOK_SECRET`。

沒填這個變數時，該路由回 503 且完全不做事——部署程式本身不會改變任何行為。

## 第三步：Vercel 環境變數

| 變數 | 必要性 | 說明 |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_TW` | 要收台幣才需要 | 沒設＝台灣頁不顯示付款鍵，只顯示預約與 LINE |
| `NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_INTL` | 要收 SGD 才需要 | 同上，英文頁 |
| `NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_TW` | 同上 | |
| `NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_INTL` | 同上 | |
| `STRIPE_WEBHOOK_SECRET` | 要記錄付款才需要 | 沒設＝webhook 503，付款照樣成功，只是站內沒有紀錄 |
| `STRIPE_ALLOW_TEST_MODE` | 只在測試期設 `true` | **正式上線前必須移除或設回非 true** |

`NEXT_PUBLIC_*` 是 build 時內嵌的：**改完要重新部署才會生效**，改 env 之後不 redeploy 等於沒改。

程式端的防呆已經寫死：值為空、`undefined`、含 `placeholder`、非 https、或網域不是 `*.stripe.com` 一律視為未設定，按鈕直接不渲染（不會出現點了沒反應的死鍵）。

## 第四步：測試模式驗收（在切正式之前做完）

1. Vercel 先設 `STRIPE_ALLOW_TEST_MODE=true`，四個 link 先填**測試模式**的 link，`STRIPE_WEBHOOK_SECRET` 填測試 endpoint 的 secret。
2. 用 Stripe 測試卡 `4242 4242 4242 4242`（任何未來到期日、任何 CVC）走完一次結帳。
3. 確認四件事：
   - [ ] 付完之後被導到 `/zh-TW/payment/success`（或 `/en/…`）。
   - [ ] Stripe 後台 Webhooks 那一頁，該筆事件回應是 **200**。
   - [ ] Supabase `events` 表出現一列 `name = 'payment_succeeded'`，`props` 裡有 `checkout_id`、`currency`、`amount_minor`、`livemode: false`。
   - [ ] **同一筆事件在 Stripe 後台按「Resend」一次，`events` 表不會多出第二列**（去重生效）。
4. 從報告頁點付款進來的那一筆，`events.session_id` 應該對得上該份報告；直接從服務頁買的則為 null，這是預期行為。

## 第五步：切正式

1. 四個環境變數換成 **live mode** 的 payment link。
2. `STRIPE_WEBHOOK_SECRET` 換成 live endpoint 的 secret。
3. **移除 `STRIPE_ALLOW_TEST_MODE`**（或設成 `false`）。留著它的話，測試付款會被當成真實營收記進資料。
4. Redeploy。
5. 用真卡買一筆最便宜的、然後在 Stripe 後台退款——這是唯一能確認 live 路徑真的通的方法，成本是幾十元的手續費。

## 這條路徑不做什麼（刻意的）

- **不保存任何卡片資料。** 站上沒有任何欄位、任何表、任何 log 會碰到卡號。
- **不把金額送進 PostHog。** 幣別、付款狀態、是不是 live mode 會進 PostHog；金額只寫進我們自己的 `events` 表。
- **不自動開發票。** 需要統編發票的買家，目前只能走人工——這與「不設公司」的裁決一致。
- **不做退款自動化。** 退款在 Stripe 後台手動執行；站上沒有退款承諾文案可以觸發它。
