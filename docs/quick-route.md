# `/[locale]/quick` — 60 秒速讀的獨立路由

**建立日期**：2026-08-08（轉換率 UX 審計落地）
**程式位置**：`app/(site)/[locale]/quick/`（`page.tsx`、`QuickReadRoute.tsx`、`params.ts`）
**元件**：`components/QuickRead.tsx`（與 `/mri` 內的速讀共用同一份，行為一致）
**網址**：`/zh-TW/quick`、`/en/quick`

---

## 這條路由的用途：站外落地頁

它存在的理由只有一個：**給站外的連結一個不要求打字的落點**。

LINE 廣播、Threads 貼文、別人串下面的回覆，這些流量的共同點是「手上沒有材料、也沒打算把履歷貼進陌生網站」。把他們送到 `/mri`，第一個動作就是那個 80% 的人拒絕的動作（14 天基線：進 `/mri` 123 人，交出素材 24 人）。送到 `/quick`，第一個動作是點一下，全程五下點完。

三個條件同時成立，這條路由才算合格，目前三個都成立：

| 條件 | 現況 |
|---|---|
| 零打字 | 五題全是按鈕，沒有任何輸入框 |
| 60 秒有結果 | 五次點擊後直接出速讀卡，沒有等待畫面、沒有 LLM |
| 不吃 Michael 任何時間 | `mapQuick` 是純函式，薪資區間讀既有的防漂移資料集，沒有任何一段內容需要他當場寫或當場回 |

第三點是提案過濾器的硬條件：他連續兩週消失，這條路由照跑，不會有人被放鴿子。

## 這條路由明確不是什麼

**它不是 `/mri` 的手機預設入口。** 審計提過這個做法，被否決了，理由記在這裡以免下一輪又被提出來：速讀不收 email，而完整流程 email 閘門留下的那份名單，是這門生意目前唯一可再觸及的資產（14 天基線 20 筆）。把預設門換成速讀，等於拿名單換完成率。

`/quick` 的結果頁底部仍然有「先存起來」的 email 區塊，但那是**可選**的，不是閘門；願意留的才會留。

## 網址就是狀態

`params.ts` 是這件事的唯一權威，摘要如下。

```
/zh-TW/quick                                              空白，五題待答
/zh-TW/quick?q1=non_sus&q2=y6&q3=no_reply                 答到第三題
/zh-TW/quick?q1=non_sus&q2=y6&q3=no_reply&q4=sg&q5=carbon&r=1   完成的速讀卡
```

由此得到三件事：

1. **可分享**：完成的卡片就是一條普通網址，別人打開看到同一張卡，不需要 token、不需要帳號、不需要後端存任何東西。選項 value 在 `content/schema.ts` 宣告為跨語系穩定，所以繁中讀者把連結丟給英文讀者，對方打開的是同一張卡的英文版。
2. **重整不會消失**：伺服器讀同一組參數，渲染同一個步驟。分頁被系統回收、手機切出去再切回來，答案都還在。
3. **上一頁等於改答案**：每答一題新題目推一筆 history，改已答過的題目則是 replace。所以瀏覽器的返回手勢是「退回上一題」，不是「離開這個網站」；history 深度最多六筆，每一筆都對應使用者真的做過的一步。

參數一律對照 content 裡的選項清單驗證。手改網址塞進不存在的值會被丟掉，湊不滿五題的 `r=1` 也不會生出卡片（會退回題目列表），避免生出一張沒有依據的判讀。

**canonical 指向乾淨的 `/zh-TW/quick`**，不帶參數。否則每一種答案組合對爬蟲來說都是一頁重複的薄內容。hreflang 用站上共用的 `alternatesFor()`，與其他頁一致。

## 事件

| 事件 | 何時 | 附帶欄位 |
|---|---|---|
| `quick_route_viewed` | 每次進站一次 | `locale`、`entry`（`fresh` / `shared_partial` / `shared_result`）|
| `quick_route_completed` | 按下「拿我的速讀卡」 | `locale`、`category`、`market`、`sector` |
| `quick_route_to_full_clicked` | 從卡片走去完整 MRI | `locale` |

**故意不沿用 `/mri` 那組 `quick_started` / `quick_completed`。** 那兩個名字是既有漏斗的分母，混進第二個曝光面會讓 Michael 已經在看的數字無聲改變。名字不同、欄位同形，兩個曝光面可以並排比較，誰也不會污染誰。

`entry=shared_result` 的量就是「這張卡被轉出去之後帶回多少人」，也就是這條路由值不值得繼續投時間的唯一指標。

## 怎麼用

貼文文案由 Michael 自己寫（機器不代寫他的第一人稱）。連結格式建議加上來源標記，例如：

```
https://<站台網址>/zh-TW/quick?utm_source=line&utm_medium=broadcast
https://<站台網址>/zh-TW/quick?utm_source=threads&utm_medium=post
```

未知的參數不影響解析，會被忽略。

## 已知限制

- **重整之後，頁內的「回上一步」按鈕會暫時不顯示**（瀏覽器自己的返回鍵不受影響，仍然正常退回上一題）。原因是頁面用「現在的步數減去進站時的步數」推算自己推過幾筆 history，重整後基準會重設。方向是安全的：寧可少顯示一個與返回鍵重複的按鈕，也不要顯示一個會把人帶離站的按鈕。
- **結果卡的分享元件（`ShareableTypeCard`）分享的是 `/types/<類型>` 那一頁**，不是這條速讀網址。那個元件不在本輪的改動範圍內。要讓它改分享速讀網址，見下方交棒項。
- **頁面的 SEO 標題與描述寫在 `page.tsx` 裡的 `QUICK_SEO`**，不在 `content/*/seo.ts`。因為 `SeoContent.titles` 目前是 home／mri／privacy／result 四個固定 key，本輪不動別人正在改的檔案。下次動 content 契約時一起搬進去。

## 一個刻意的取捨：這頁是動態渲染

`next build` 把 `/[locale]/quick` 標為 ƒ（每次請求在伺服器渲染），因為頁面要讀 query string。代價很小（沒有任何 I/O，就是一次純渲染），換到的是**分享出去的卡片直接寫在 HTML 文件裡**：連結預覽抓得到、爬蟲看得到、讀者不會先閃一次題目列表再跳成結果。

若改成用戶端讀 `useSearchParams()` 就能靜態化，但上面那三件事會同時失去。除非流量大到這一項變成成本，否則不要換。

## 交棒項

- `app/sitemap.ts` 的 `STATIC_PATHS` 要加 `'/quick'`（該檔不在本輪這個 agent 的檔案領域）。
- 若要讓分享卡直接帶出速讀網址，改的是 `components/ShareableTypeCard.tsx` 的 `shareUrl`，呼叫端在 `components/QuickRead.tsx`。
