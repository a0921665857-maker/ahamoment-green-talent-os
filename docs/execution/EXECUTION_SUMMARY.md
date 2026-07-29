# EXECUTION_SUMMARY — Gate 8

> 2026-07-30 · 自主執行 · 八個工作包 · 九個 commit

## 完成

| WP | 內容 | Commit |
|---|---|---|
| 0 | 正典策略文件 ＋ 六份過時文件標 SUPERSEDED ＋ AGENTS.md 商業常數 | `18c413d` |
| 1 | 服務收斂成兩檔付費 ＋ 單一價格來源 ＋ 免費對談改名 | `d8de4ce` |
| 2 | Stripe Payment Links 全鏈（webhook／去重／測試隔離／成功頁／取消頁） | `05715a7` |
| 3 | 量測修正（mri_started、判斷力、捲動深度、服務頁、事件字典） | `3860d6c` |
| 4 | 共用 header ＋ footer 全站索引 ＋ 桌機 LINE ＋ skip link | `416d5ce` |
| 5 | 90 天 purge cron ＋ migration ＋ 隱私揭露三節 ＋ 誰會看到 | `e46b8fb` |
| 6 | 揭薪指數對帳與公開頁（22 格全列，3 格有數字） | `5108acd` |
| 7 | 六份營運材料 | `0e15ab6` |
| — | merge 進本機 main | `7159777` |

## 未完成

| 項目 | 為什麼 | 誰接手 |
|---|---|---|
| **push `origin main`** | machine hook（`guard-hook.mjs`）阻擋 push 到 main，未繞過 | Michael 一行指令 |
| **Stripe 實際啟用與測試卡驗證** | 沒有 Stripe 憑證；規則禁止在缺憑證時製造假的付款成功 | Michael 照 `STRIPE_SETUP.md`，約 30 分鐘 |
| **揭薪指數 15 筆抽查** | 沒複驗就標 `manually_verified` 等於偽造驗證 | Michael，約 40 分鐘 |
| **首頁敘事收斂** | 首頁是他親手寫的、旗艦卡是他 07-29 才放的，不自行改動 | 待裁決（FOUNDER_DECISIONS #4） |
| **purge 對真實資料庫跑第一次** | 沒有 production 憑證，且刪除不可逆 | Michael 先打 dry run 端點 |
| `ProgressStages` 無 live region、`MriIntakeFlow` lint error | 既有技術債，與 Gate 8 目標無關，改動風險高於收益 | 後續 |

## 變更檔案

新增 21 個、修改 42 個、刪除 0 個。主要新檔：

```
lib/services.ts · lib/stripeWebhook.ts · lib/purge.ts
components/SiteHeader.tsx · SiteFooter.tsx · ServiceCtas.tsx · ScrollDepth.tsx · PageViewPing.tsx
content/nav.ts · content/payment.ts · content/salaryIndex.ts · content/salaryIndexCopy.ts
app/(site)/[locale]/salary-index/page.tsx · payment/success · payment/cancelled
app/api/webhooks/stripe/route.ts · app/api/cron/purge/route.ts
supabase/migrations/20260730_purge_index.sql
docs/product/CURRENT_PRODUCT_STRATEGY.md · docs/analytics/EVENT_DICTIONARY.md
docs/execution/{BASELINE_REPORT,STRIPE_SETUP,TEST_REPORT,CHANGELOG_GATE_8,FOUNDER_DECISIONS,NEXT_MORNING,EXECUTION_SUMMARY}.md
ops/{outreach,validation,services}/*.md
tests/{payments,salaryIndex,nav,purge,events}.test.ts
```

## Migrations

一個，新增型：`supabase/migrations/20260730_purge_index.sql` — 建立一個 partial index 支援 purge 掃描。**未對 production 執行**。Rollback 寫在檔案第一段：`drop index if exists source_materials_purge_idx;`，且移除它只影響查詢計畫、不影響行為。

## 環境變數

**新增（全部選配，未設就是功能不出現，不會壞）**

| 變數 | 未設時的行為 |
|---|---|
| `NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_TW` / `_INTL` | 台灣／英文頁不顯示付款鍵 |
| `NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_TW` / `_INTL` | 同上 |
| `STRIPE_WEBHOOK_SECRET` | webhook 回 503，付款仍會成功，只是站內沒紀錄 |
| `STRIPE_ALLOW_TEST_MODE` | 測試模式付款一律丟棄（正式環境應維持未設） |
| `PURGE_ENABLED` | purge cron 每天跑但只計數不刪除 |
| `NEXT_PUBLIC_LINE_QR_PATH` | footer 不顯示 QR，只顯示可複製的 LINE ID |

**已作廢**：`NEXT_PUBLIC_STRIPE_LINK_DEEP_READ`、`_TEARDOWN`、`_SPRINT`、`_PACKAGE`（程式已不再讀取）。

## 部署

- **Preview**：`claude/gate-8-autonomous-execution` 已 push，Vercel 會自動建。
- **Production**：本機 `main` 已合併並重新驗證（typecheck ✅ · 221 tests ✅ · build ✅），領先 `origin/main` 九個 commit，**尚未 push**。

## 測試

221 通過（基線 165，+56），零失敗。typecheck 與 build 全綠。lint 維持在動工前的 1 error + 1 warning，未增加。詳見 `TEST_REPORT.md`。

## 已知技術風險

1. **付款鏈路未經真實金流驗證。** 單元測試覆蓋簽章、去重、模式隔離，但沒有一筆真的錢走過。第一次啟用時請照 `STRIPE_SETUP.md` 用測試卡走完，並執行「Resend 重送一次確認去重」那一步。
2. **`mri_started` 的定義改了，新舊數字不可比。** 絕對數會下降。做任何 before/after 對比時分母改用 `material_submitted` 或 `questions_submitted`。
3. **purge 一旦開啟即不可逆。** 建議先 dry run 看筆數。
4. **揭薪指數尚未逐筆複驗**，所以敘事上不能宣稱經過稽核。
5. **首頁與新導覽的敘事還不一致**（九個出口 vs 三個決策入口），這是刻意留給你的決定。

## 回滾

```bash
git revert -m 1 7159777
```

完整回到目前的 production 狀態。沒有跑過破壞性 migration，沒有刪除任何資料，沒有寄出任何信件——所以回滾之後不會留下任何殘影。
