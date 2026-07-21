# MRI 漏斗實走審計 2026-07-21（Fable 冷啟動用戶視角全鏈路）

> 方法：真瀏覽器走 prod（只讀，避免污染 booking/material 指標）＋隔離環境 local 實提交（PostHog／Resend 以空環境變數斷開，驗證 `window.posthog` undefined、零外送）；PostHog HogQL 以 person 去重重算漏斗；測試 session（email `test-audit-20260721@example.com`）已 soft-delete。
> 本檔是 mri-autoresearch 第二實驗軸的輸入正典。

## 真漏斗（14 天，person 去重；舊 baseline 用事件數，口徑錯誤）

| 站 | 人數 | 佔開始 |
|---|---|---|
| mri_started | 123 | 100% |
| material_submitted | **24** | **19.5%（大峽谷在這裡：80% 流失）** |
| profile_confirmed | 22 | 17.9% |
| questions_submitted | 20 | 16.3% |
| booking_clicked | 4 人 | 3.3% |
| quick_started／completed／轉完整 | 9／9／5 | 側門發現率 7%，完成率 100%，轉完整 56% |

口徑修正（取代 skill 舊敘述）：
- `input_method_selected` **不是漏斗站**：預設 tab（notes_paste）從不觸發；84 次事件只來自 38 人（人均 2.2 次＝切換猶豫訊號）。「84→28 中段流失 67%」是事件數誤讀，作廢。
- `report_viewed` 67 人 >> 交素材 24 人：localStorage 去重只擋同瀏覽器回訪，跨裝置、清 storage、**被分享的報告連結**照發。以它當預約轉換分母會嚴重稀釋，作廢；預約分母改用「當期新產出報告的本人」（≈questions_submitted 人數）。
- Rageclick：30 天 10 人（扣 localhost），全部集中 `/zh-TW/mri`，桌機手機各半；含 threads 與 salary_report 導流 UTM 的落地也在氣。

## 發現（依轉換槓桿排序）

### F1（已更正 2026-07-21：原判錯誤，prod 寄信正常）
- **更正**：Gmail 實據（07-17、07-18 三封「你的綠領職涯 MRI 報告寫好了」，寄件人 `mri@ahamoment-career.com`，收件含 +nametest／+warmtest／本尊）證明 **prod 的 Vercel 環境有設 RESEND_FROM，用戶報告信正常寄出**。等待文案的承諾在 prod 成立。
- 誤判根因：拿本機 `.env.local`（確實缺 `RESEND_FROM`）推斷 prod 環境，越界推論。教訓已記：env 斷言必須對著它所在的環境驗證。
- 殘餘事實：本機開發環境寄信仍為 no-op（`lib/email.ts:19-21` 閘門）。屬預期行為（開發不寄信），不需修。

### F2（結構性最大）速讀側門能見度 7%，但它是轉換最好的資產
- 幾何實測：入口在桌機 y=744（720 摺線下 24px）、手機 1.1 屏。第一屏＝標題＋四 tab＋空白貼上框（作業牆）。
- 數據：找到側門的 9 人全部做完、5 人轉完整版。實走驗證速讀端到端成品級（類型卡＋薪資帶＋分享卡）。
- 修法（餵 autoresearch 軸二第一個實驗）：入口上移至 tabs 同列或 hero 下方、text link 改按鈕。量尺＝mri_started→material_submitted person rate（不是舊的 input_method_selected）。

### F3 提交按鈕死區＝rageclick 主嫌
- `MriIntakeFlow.tsx:563-571`：按鈕 `disabled={!inputReady}`，onClick 掛的驗證錯誤（`errors.consentRequired`／`errors.tooShort`）**永遠不可達＝死碼**。
- 實測：13 字＋hint 只說「貼上一些內容、並勾選下方的資料處理同意」——**不講最低字數（zh 80／en 150）**，計數器只顯示現況不顯示門檻。用戶貼 60 字勾了同意，提示看似滿足、按鈕依然無反應＝rage。
- 修法：按鈕改常啟用，click 時觸發現有錯誤訊息（死碼復活）＋計數器改「還差 N 字」＋未勾同意時捲動到同意區。

### F4 零題目時的信任裂縫（只有實走抓得到）
- 素材夠完整時 `selectQuestions` 回 0 題，頁面標題仍是「有幾件事，你的資料還沒告訴我們：三到五個快問快答」，實際只剩 email 欄＝在最敏感的關卡讀起來像「原來只是要收信箱」。
- 修法：`questions.length === 0` 時換標題（「你的資料夠完整，直接產報告——留個 email 保存連結」）或 detector 保底 2 題。

### F5 taxonomy 錯位＋validation 死碼
- 實測 confirm 頁 chips 漏出原始 slug `sustainable-supply-chain`（它是 sector slug，被抽取器放進 domains；`labelFor('domains',…)` 查無 fallback 回 slug）。
- `lib/taxonomy.ts:96` `partitionSlugs` **全 repo 零呼叫**：檔頭承諾的「未知詞落 free_text、每月審核」維護迴圈不存在。
- 修法：pipeline 後處理套 partition＋跨組 re-home；`labelFor` 加跨組查詢當 UI 保險。

### F6 分析口徑修正案（寫回 autoresearch）
- 軸二量尺改為：`mri_started → material_submitted`（person 去重）。
- 預約轉換分母改為當期新報告本人，不用 report_viewed。
- 面板／變體實驗照舊，但假設優先序以 F2–F4 為先（結構修復 > 文案微調）。

## 修復紀錄（2026-07-21，branch `fix/funnel-f2-f5-walkthrough`，commit 7d39dcd）
F2 速讀側門上移第一屏（桌機 y=744→302、手機 1.1 屏→0.58 屏，text link 改卡片＋實心按鈕）；F3 提交按鈕常啟用＋按鈕旁 role=alert 錯誤＋計數器「還差 N 字」＋consent 捲動定位＋新增 fileMissing 錯誤；F4 零題時換 introComplete 文案；F5 `normalizeGreenEconomy` 掛進 submit 路由＋`labelFor` 跨組 fallback（實測同素材 slug 洩漏消失）；追加 report 等待頁 LINE 保存。typecheck ✅ 112/112 tests ✅（+6 taxonomy）。

## 正分（實走驗證通過）
抽取品質高（職位／公司／意向全中，年資 4+2 正確合計 6）；草稿自動保存＋重整還原＋切語言不掉字；報告個人化銳利（引用 20 投 3 面、「太合規導向」回饋並精準重述）；6 條 Calendly 連結 token/utm 全對；prod console 零錯誤；landing 桌機首屏健康（hero 0.2 屏、雙 CTA 0.7 屏）。

## 小瑕疵（不進主修列）
報告把 4+2 年說成「在四大累積 6 年」（雇主混淆，生成層誇合）；report 頁等待狀態沒有 LINE 保存（只有 flow 內短暫 generating 有）；速讀某些組合只出台灣錨點沒出 SG band。

## 時序實測（local，含 dev 編譯）
提交→抽取完成 ≤26s；確認→題目 ≤2.5s；答題→跳轉報告頁 ≤6s；報告生成約 3–5 分（文案已誠實預告）。
