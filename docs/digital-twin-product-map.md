# Career Digital Twin 產品圖 v1（2026-07-21，階段二；Michael 點頭即開工）

一句話：把 MRI 從「一次性報告」變成「可更新的職涯檔案」。用戶情況變了回來重跑，系統顯示兩次之間的變化。這就是 PDF 最終報告說的 recurring 核心，也是 ChatGPT twin 案的最小誠實版。

## 範圍（v1 只做三件事）
1. **我的報告串**：同一 email 的多次 MRI session 串起來（email magic link 認領，沿用 Resend，不做 OAuth 不做密碼）。
2. **重跑與對比**：報告頁加「情況變了，更新我的檔案」入口 → 走既有 MRI 流程 → 新報告尾附「與上次相比」區塊（維度分數 diff＋一句變化判讀，確定性計算不加 LLM 呼叫）。
3. **付費者優先**：重跑入口只對付費客戶與受邀者開放（環境變數白名單起步）。理由：每次重跑燒 LLM 成本，免費無限重跑＝燒錢做功德；付費者權益反而強化付費理由。

## 明確不做（v1）
帳號系統／密碼、JD 收藏庫、自動監測提醒、公開個人頁、任何新 LLM 功能。

## 檔案層
- DB：sessions 已有 email 欄；加一張 `profile_links`（email_hash, session_id, claimed_at）或直接以 email 查詢聚合，migration 需 Michael 核（鐵律：不自動跑 migration）。
- 頁面：`/[locale]/twin/[email-token]`（magic link 落地頁，列出歷史報告＋對比入口）。
- 對比計算：純函數 `compareReports(a, b)` 進 lib/scoring，可測試。

## 排程層
- 無新排程。30/90 天 outcome 信（docs/outcome-loop-design-2026-07-21.md，已設計未開）就是 twin 的回訪引擎，開關仍由 Michael 決定。

## 人的動線
用戶：收到 magic link → 看歷史報告 → 點更新 → 走 MRI → 看 diff。
Michael：無新日常負擔；付費交付時在 case_records 記一筆（既有 P10 流程）。

## 誠實時間帳（兩欄制）
- 機器欄：build 約兩個晚上（頁面＋聚合查詢＋diff 函數＋測試＋雙尺寸實走）。
- 世界欄：要有第二次 MRI 的真人才有 diff 可看；付費案例 ≥10 前，twin 的資料價值靠時間長，不靠工程趕。

## 第一卡點預測
magic link 認領的隱私邊界：email 打錯或轉寄會看到別人的報告串。對策：連結一次性＋短效（24h）＋每次認領寄通知信。

## Kill criteria（預註冊）
上線 60 天內回訪重跑 <5 人 → twin 降級為付費交付的內部工具（只在諮詢時由 Michael 手動重跑），不再投工程。
