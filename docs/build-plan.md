# 綠領職涯產品 — 完整執行藍圖(Build Plan)

> **北極星**:把「免費氣候職涯測評」變成一個會成長、會回訪、會付費的產品線。
> 瓶頸不是點子,是**分發**。所有優先序都圍繞:擴散 → 轉化 → 留存 → 信任。

---

## 0. 接手前必讀(脈絡與鐵律)

**創辦人**:單兵、非工程師,用 Next.js / Supabase / Anthropic vibe-code。強項是領域可信度(INSEAD、四大 ESG、氣候金融)、說故事、APAC 人脈。弱項是工程可靠度。

**已定的策略結論**(不要再發散找新點子):
- 專注**這個氣候職涯產品**(它的核心就是 Career MRI 測評流程,程式碼裡的 `mri/*` 即此產品)。不開全新領域、不另起陌生客群。
- 產品線一條:**免費測評(#1,已存在)→ 付費「轉職副駕」SaaS(#2)→ 雇主端人才產品(#3,之後)**。

**建構鐵律**:
1. 只 vibe-code「核心價值不依賴高可靠度工程」的東西。
2. **用官方/聚合 API,不自寫爬蟲**(爬蟲=維護地獄)。
3. **「任務」不要做成「功能」**(寄信、找人脈是任務,不是軟體)。
4. 不漂綠、不碰碳權評級(避免與 Sylvera 競業)。
5. 先能**量測**,再談優化(沒有數據就是在猜)。

**技術假設**:Next.js + Supabase + Anthropic + Resend(repo 已有)+ Vercel(cron / OG image)+ Stripe(金流)。

---

## 1. 現況(Product #1)
免費氣候職涯測評 → 個人化報告 → 留下 lead。已在本 repo 運作。

---

## 2. 要建的東西(依「影響 ÷ 力氣」排序)

### P0 — 立刻做(高槓桿、低力氣)

**[P0-1] 分析埋點(PostHog,之後補 GA4)**
- 裝 `posthog-js`,App 外層包 Provider,自動抓 pageview。
- 埋事件漏斗:`landing` → `assessment_started` → `assessment_completed` → `lead_captured` → `share_clicked` → `checkout_started` → `paid`。
- **隱私**:錄影回放開「mask all inputs」(會收 CV/個資),敏感欄位加 `ph-no-capture`;若有歐洲流量設 cookieless。
- 驗收:能在 PostHog 看到完整漏斗,每步轉化率。
- 成本 $0。

**[P0-2] 可分享成果卡(免費分發引擎,最重要)**
- 測評完成後,用 Next.js OG image(`@vercel/og` / satori)動態生成一張漂亮圖:使用者的「氣候職涯路徑 / 類別 + 一句亮點 + 產品品牌 + 網址」。
- 一鍵分享到 LinkedIn / Threads;埋 `share_clicked`。
- 驗收:完成頁有「分享我的結果」按鈕,產出帶品牌的圖。
- 成本 $0。

**[P0-3] Email 養成序列(Resend,最便宜變現)**
- `lead_captured` 後觸發 5–7 封序列:歡迎 → 乾貨 → 案例/社會證明 → 軟性導購(付費副駕/導師)→ 收尾。
- 用 Supabase 存 lead + 寄送進度,Vercel Cron 每日推進序列。
- **推的是這個氣候產品,不是 MRI。**
- 驗收:留資料後自動開始收到序列信。
- 成本 $0。

**[P0-4] Blog + Podcast 嵌入(信任分,一個下午)**
- Blog:抓 RSS(Substack/Medium/WP/Ghost),server component 顯示最新數篇。
- Podcast:嵌 Spotify/Apple iframe,或抓 RSS 列出集數。
- 驗收:首頁/關於頁出現最新文章與單集。
- 成本 $0。

### P1 — 接著做

**[P1-1] 個人化職缺通知(回訪鉤子)**
- **不爬站**。接合法 API:MyCareersFuture(免費)、Adzuna(免費額度)、Google Jobs via SerpApi(~US$75/月,選配)。
- Vercel Cron **每日**同步(不需即時)→ 存 Supabase → 用使用者測評的類別/關鍵字**配對** → 站內 feed + email 通知。
- 重點是「**符合你背景的新職缺**」,不是職缺牆。
- 驗收:使用者回站看到/收到對得上他的職缺。
- 成本 $0–100/月。

**[P1-2] Product #2 MVP:轉職副駕(Climate Career Transition Copilot)**
- 付費 SaaS。MVP 範圍(刻意小,避開工程難點):
  1. 使用者**貼上一則職缺內容** + 帶入測評時的 CV;
  2. Anthropic 產出:客製化履歷重點 + 求職信 + 「為什麼轉氣候」面試陪練題;
  3. 簡單 pipeline 表:追蹤多個應徵與狀態。
- **不做職缺爬蟲**(使用者自己貼職缺);重用 #1 的 CV/AI 技術。
- 金流:Stripe 月訂閱(求職期間付費);上岸後降級留存層。
- 驗收:付費牆 + 三大功能可用 + 訂閱跑通。
- 成本:Stripe 抽成 + Anthropic 用量。

### P2 — 之後

- **[P2-1] 導師模組**:導師是手動招募(見 §4),軟體只做「導師名錄 + 預約 + 收費」。
- **[P2-2] 推薦機制**:邀朋友雙方得益,做病毒迴圈。
- **[P2-3] 薪資/路徑 benchmark**:用自家累積的測評資料(別人沒有),好分享、強護城河。
- **[P2-4] 雇主端人才產品(#3)**:等候選人流量累積後,賣給搶氣候人才的雇主(這裡才是大錢)。

---

## 3. 明確「不要建」的東西(及原因)

- ❌ **Email connector / 自動抓聊聊名單**:這是一次性任務。匯出 CSV → Resend 群發,一小時搞定,別 vibe-code。
- ❌ **自寫爬蟲(LinkedIn / 104 / mba.com)**:LinkedIn 違反 ToS 且爬不動;104 維護地獄;mba.com 不是職缺站。一律改用 §P1-1 的 API。
- ❌ **自動抓 LinkedIn 人脈當導師**:技術+法律上不可行。改手動(見 §4)。
- ⚠️ 修正:**「MRI」就是本產品的核心測評(Career MRI),不是要避開的東西**——程式裡的 `mri/*` 路由與元件正是主流程,要持續強化。要避開的是「開一個全新、與此無關的產品/客群」。
- ❌ **職缺即時更新**:每日同步就夠,別過度工程。

---

## 4. 分發/行銷(非軟體,但要同步進行)

- **暖名單外推**:把「30 分鐘聊聊」名單(Calendly 等匯出 CSV)用 Resend 群發,推**氣候產品**。
- **Thread 爆款引擎**:用 `docs/thread-engine.md` 的 prompt,把想法/INSEAD 課程蒸餾成 thread(3 形式 × 3 語氣,連結放第一則留言、留言區導購)。持續發=製造爆文的唯一方法。
- **手動招募導師**:LinkedIn native search 篩「School=INSEAD、Region=APAC、Company=Deloitte 等」→ 用邀請範本約。(可向協作的 AI 索取布林查詢語法與信件範本。)

---

## 5. 成本總表

| 項目 | 成本 |
|---|---|
| PostHog / GA4 / Resend / Blog-Podcast / OG 卡 | $0 |
| 職缺 API(MyCareersFuture/Adzuna 免費;SerpApi 選配) | $0–100/月 |
| Stripe | 交易抽成 |
| Anthropic | 用量 |
| LinkedIn Sales Navigator(選配) | ~$100/月 |

**沒有任何一項需要請工程師。**

---

## 6. 建議執行順序(給 build session 的待辦)

1. P0-1 埋 PostHog(先能看見漏斗)。
2. P0-4 接 blog/podcast(最快、加信任)。
3. P0-2 可分享成果卡(開分發)。
4. P0-3 Email 養成序列(開變現)。
5. 觀察 PostHog 漏斗 1–2 週,找最大漏點,先補它。
6. P1-1 個人化職缺通知(回訪)。
7. P1-2 轉職副駕 MVP + Stripe(主變現)。
8. 之後再進 P2。

> 每完成一項,回頭看 PostHog 漏斗有沒有改善。**數據說話,不要憑感覺加功能。**
