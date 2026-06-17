# PRIVACY_AND_CONSENT.md

## Principles
Minimize, explain, ask, honor deletion, never train, never claim outcomes, never imply platform access (LinkedIn/ChatGPT/Claude are never "connected" — users voluntarily paste/upload their own materials).

## Data inventory
| Data | Where | Retention | Purpose |
|---|---|---|---|
| Raw materials (CV text/PDF, pastes, transcripts) | source_materials + private Storage bucket | **purged at 90 days** (or on deletion request) | extraction; paid-service prep |
| Extracted profile (PII-minimized: no phone/address/personal email) | extracted_profiles | until deletion request | scoring, report, aggregate (only if consented) |
| Email, name | mri_sessions | until deletion request | report delivery, follow-up |
| Scores, category, report | scores/reports | until deletion request | the product |
| Funnel events | events (no PII in props — enforced) | indefinitely | product analytics |
| Voice audio | — | **never stored** (V1 accepts transcripts only) | — |

## Consent UX (inline at submit step; both required-state and copy are binding)
- ☑ **Required:** processing consent — submit disabled until checked.
- ☐ **Optional:** anonymized aggregate insights.
- Above the checkboxes: the redact-freely hint and a one-line retention summary, linking to `/{locale}/privacy`.

### Consent copy v1 — English (`content/en/consent.ts`)
- processing.label: "I agree that my uploaded materials will be processed by AI to generate my Green Career MRI report."
- processing.detail: "Your materials are used only to create your report and, if you choose to work with us, to prepare for that work. Raw uploads are automatically deleted after 90 days. We never use your data to train AI models, and we never share or publish it. You can ask us to delete everything at any time."
- aggregate.label: "Optional: my anonymized profile data may be included in aggregate market insights (never identifiable, never your documents)."
- redact.hint: "Feel free to remove names or contact details before uploading — the analysis works without them."
- no_access.note: "We never access your LinkedIn, ChatGPT, or Claude accounts. You choose what to share."

### Consent copy v1 — 繁體中文 (`content/zh-TW/consent.ts`)
- processing.label: 「我同意系統以 AI 處理我提供的資料，用於產生我的綠色職涯 MRI 報告。」
- processing.detail: 「您的資料僅用於產生這份報告；若您之後選擇付費服務，也會用於該服務的準備。原始上傳內容將於 90 天後自動刪除。我們不會用您的資料訓練 AI 模型，也不會對外分享或公開。您可以隨時要求我們刪除全部資料。」
- aggregate.label: 「選填：同意將我的資料以匿名方式納入整體市場洞察（絕不可識別個人，亦不會使用您的文件）。」
- redact.hint: 「上傳前可自行刪去姓名或聯絡方式——不影響分析品質。」
- no_access.note: 「我們不會、也無法存取您的 LinkedIn、ChatGPT 或 Claude 帳號。所有資料皆由您自行提供。」

## Claims policy (hard ban, injected into prompts)
Never guarantee or imply guaranteed MBA admission, salary levels, job offers, or career outcomes — in UI copy, reports, emails, or memos.

## Deletion procedure (V1)
Privacy page + report footer: "Email <contact> to delete your data — completed within 7 days." Admin executes the dashboard Delete button (cascade per DATA_MODEL.md). Log date in admin_notes before anonymization.

## PDPA (Singapore) alignment notes
Purpose limitation (stated above) · consent before collection (checkbox) · access/correction (confirmation-page edits + email channel) · retention limitation (90-day raw purge) · a named contact on the privacy page. This is alignment, not legal sign-off — see KNOWN_LIMITATIONS.md item 1 (a lawyer review covers both PDPA and the founder's EP/payment structure question together).

## Security posture
Service-role DB access from server routes only; RLS deny-all; private storage bucket; report URLs unguessable tokens (sharing tradeoff documented); no PII in logs or events; admin behind password middleware (ARCHITECTURE.md); HTTPS everywhere (Vercel default).

## Human-review positioning (trust copy, reused at CTA)
"Human review is private. Your materials are never used as public examples or testimonials without your explicit written permission."
