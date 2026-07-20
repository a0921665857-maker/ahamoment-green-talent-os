# PAID_OFFER_STRATEGY.md

> 2026-07-21 同步:價格表改為與上線 content(`content/zh-TW/paidOffers.ts`、`content/en/paidOffers.ts`)一致的 NT$ 實價,舊 USD placeholder 作廢。
> 轉換層(通話→付費)的作戰文件在 PIS repo:`modules/ahamoment/revenue_sprint/REVENUE_DOCTRINE.md` 與 `CONSULT_PLAYBOOK.md`。本文件管「賣什麼、對誰、怎麼擺」;那兩份管「怎麼成交」。

## Offer ladder(上線實價,2026-07)

| ID | Offer | 價格(早鳥前原價) | 交付 | Michael 時數 | 對象 |
|---|---|---|---|---|---|
| `intro_call_free` | 免費 30 分鐘:報告親自唸給你聽 | 免費 | 30 分線上對談,無書面 | 0.5 | 觀望者;**所有付費路徑的入口與結帳頁** |
| `deep_read` | 深度書面解讀 | NT$1,200(1,500) | 非同步書面,48h | ~1 | 要書面不要通話的人;通話降階首選 |
| `consult_60` | 1 小時診斷諮詢 | NT$2,200(2,800) | 60 分線上 | 1 | 要真人把方向一次談清楚的人 |
| `teardown_90` | 90 分鐘故事拆解 | NT$2,980(3,800) | 90 分對談+72h 書面備忘 | ~2 | 通用入口級付費 |
| `cv_linkedin_review` | CV 與 LinkedIn 審閱 | NT$2,980(3,800) | 非同步審閱+30 分通話 | ~2 | 故事已定、文件賣低自己 |
| `mock_interview_pack` | AI＋真人模擬面試組 | NT$3,800 起(4,800) | AI 練習+1–2 場真人模擬 | ~2–4 | 幾個月內要面試 |
| `offer_negotiation` | Offer 與薪資談判教練 | NT$3,800(4,800) | 60 分策略對談+書面談判備忘 | ~2 | 已有/即將拿 offer |
| `climate_positioning_sprint` | 氣候職涯定位衝刺 | NT$9,800 起(12,000 起) | 3 週 3 次會議 | ~6 | 賽道抉擇/技術翻商業 |
| `mba_story_sprint` | 單校 MBA 故事衝刺 | NT$12,000 起(18,000 起;可混合成功費) | 4 週 4 次 | ~8 | 目標校明確 |
| `climate_finance_transition` | 氣候金融/影響力投資轉職衝刺 | NT$12,000 起(15,000 起) | 3 週 3 次+目標角色對位分析 | ~6 | ESG 顧問跨資本市場 |
| `full_package` | 完整定位方案 | NT$30,000 起(48,000 起;可混合成功費) | 8 週端到端 | ~16 | 下定決心的錨點方案 |

**Off-menu(不進網站,只在通話與 outbound 提):**「14 天面試衝刺」NT$6,800 全額預付——JD 對位分析+90 分拆解+1 場模擬面試+賽前校準;定義與時數帳見 PIS `REVENUE_DOCTRINE.md` 第五節。衝刺帳本(PIPELINE.md)在測的就是它。

**Binding policies(與上線文案一致):** 拆解費 30 天內全額折抵任何衝刺/方案;首次合作不滿意全額退;真人審閱保密、資料未經書面同意不作案例。

## Presentation rule(binding,未變)
報告 CTA 恰好三個:該分類的 **primary offer**、`teardown_90` 低風險入口、`full_package` 錨點。Landing page 可列全部。primary 就是 teardown 時,改列 teardown+該分類 secondary+錨點。

## Category → offer mapping(classifier 消費;改這裡必須同步 `scoreWeights.ts`——本次未動語義)

| Result category | Primary | Secondary overlay |
|---|---|---|
| `ready_for_mba_story_sprint` | `mba_story_sprint` | — |
| `strong_profile_weak_story` | `teardown_90` | `cv_linkedin_review` if cv_readiness ≤ 2 |
| `climate_career_builder` | `climate_positioning_sprint` | — |
| `career_positioning_before_mba` | `climate_positioning_sprint` | `teardown_90` |
| `profile_building_needed` | `teardown_90`(誠實的「先累積」指引是主訊息) | — |
| `high_potential_low_commercial_clarity` | `climate_positioning_sprint` | `teardown_90` |
| `interview_ready_positioning_weak` | `teardown_90` | `mock_interview_pack` |
| `cv_strong_narrative_weak` | `teardown_90` | — |
| Overlay rule(any) | — | `mock_interview_pack` if interview_readiness ≤ 2 且 timeline ≤ 6 個月 |

未進 mapping 的四檔(`deep_read`、`consult_60`、`offer_negotiation`、`climate_finance_transition`)定位:**通話中的人工推薦選項**(降階、金融背景、談判場景),不進自動分類,避免動 classifier。

## Lead grading(未變)
- **A:** timeline ≤ 6 月 且 mid-level+ 且 category ∈ {1,2,4,6,7,8}
- **B:** timeline ≤ 12 月,或分數強但時程模糊
- **C:** 其他(nurture;V1 不花人工跟進)

## Capacity reality(NT$ 版)
每週客戶時數 4–6h ⇒ 可持續組合 ≈ 每週 2 場 teardown+1 條衝刺在跑 ⇒ 目前價位月天花板約 **NT$30k–45k**。結論不變:漏斗優化「lead 品質」而非數量;先漲價再衝量。價格階梯的下一步驗證點:衝刺帳本 3 筆 NT$6,800 成交且滿意度 ≥8/10 → 測 NT$9,800。

## Follow-up sequence(V1 人工寄送;AI 只擬稿)
- D0:報告交付信(模板+個人化一句)。
- D+1(通話後):recap 信——三重點(用對方原話)+一個通話沒講完的觀察+單一 CTA;逐字結構在 `CONSULT_PLAYBOOK.md`。
- D2:從對方 profile 抽一個追加洞察+軟 CTA。
- D6:分類對應案例note+最後一次 CTA,之後停。模板在 `emails.ts` 各 locale。
- 30/90 天結果閉環(見 `docs/outcome-loop-design-2026-07-21.md`):不賣東西,收結果,養見證。
