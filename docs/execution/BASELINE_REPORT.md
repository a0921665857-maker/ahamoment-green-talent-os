# BASELINE_REPORT — Gate 8 起跑基線

> 2026-07-29 · branch `claude/gate-8-autonomous-execution`（自 `main` @ `4875e8f` 分出）
> 本檔記錄「動工前」的狀態，用途是區分既有失敗與本次新增失敗。

## Working tree（動工前）

四個未提交的檔案，全部是內容線文件，**原樣保留、本次不動**：

```
 M docs/material-bank.md
 M docs/threads-log.md
 M docs/threads-published-corpus.md
 M docs/voice-canon.md
```

## 指令（single source：AGENTS.md）

| 用途 | 指令 |
|---|---|
| 安裝 | `npm install`（npm only，`package-lock.json` 存在） |
| 型別 | `npm run typecheck` |
| 測試 | `npm test`（Vitest，`tests/**`） |
| Lint | `npm run lint`（ESLint 9 flat config） |
| Build | `npm run build` |
| 部署 | push branch → Vercel preview；只有 `main` 進 production |

## 基線結果

| 檢查 | 結果 | 備註 |
|---|---|---|
| `npm run typecheck` | ✅ PASS | 零錯誤 |
| `npm test` | ✅ PASS | **15 檔 / 165 測試全過**（AGENTS.md 寫的「78 tests」已過期，本次順手更新） |
| `npm run lint` | ⚠️ **1 error + 1 warning（既有，非本次造成）** | 見下 |
| `npm run build` | ✅ PASS | 全路由編譯成功 |

### 既有 lint 失敗（動工前就存在）

1. **error** `components/MriIntakeFlow.tsx:118` — `react-hooks/set-state-in-effect`：
   effect 內同步 `setText()` 還原 localStorage 草稿。
   **本次不修**：這是漏斗最關鍵元件（草稿還原保護通勤中斷），改動風險高於 lint 潔癖，且與 Gate 8 目標無關。列入既有技術債。
2. **warning** `components/ProgressStages.tsx:27` — `done` 宣告未使用。同上，不動。

**驗收判準**：本次每個工作包完成後，lint 的問題數必須維持 **1 error + 1 warning**，不得增加。

## 既有架構事實（影響 WP-2 的裁決）

- **沒有 `stripe` npm 套件**。`package.json` 依賴只有 `@anthropic-ai/sdk`、`@supabase/supabase-js`、`next`、`posthog-js`、`react`、`resend`、`zod`。
- 既有「Stripe 整合」＝ **Stripe Payment Links**（hosted 付款頁），透過 `NEXT_PUBLIC_STRIPE_LINK_*` 環境變數注入，不是 API 整合、沒有 checkout session、沒有 webhook。
- `.env.example` 列了 `NEXT_PUBLIC_STRIPE_LINK_TEARDOWN / SPRINT / PACKAGE` 三個變數，但**全 repo 沒有任何一行程式碼讀它們**（死變數）；實際被讀的是 `NEXT_PUBLIC_STRIPE_LINK_DEEP_READ`。
- 既有 cron（`vercel.json`）：morning-brief 每日 23:00 UTC、followups 每日 01:00 UTC、outcome-loop 每週日 02:00 UTC。**沒有 purge cron**。

## 環境變數

依安全邊界與 guard hook，`.env*` 一律不讀不寫。所有環境變數的實際值狀態為 unknown，只依 `.env.example` 與程式碼判斷「有沒有被讀」。缺值時的行為一律走程式碼裡的 fallback。
