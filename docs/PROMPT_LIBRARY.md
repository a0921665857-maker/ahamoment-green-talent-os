# PROMPT_LIBRARY.md

## Conventions (binding for all prompts)
1. One file per prompt in `lib/prompts/`, exporting `{ id, version, model, temperature, build(input): string, outputSchema (zod) }`.
2. Output is **JSON only** — no prose, no markdown fences. Caller validates with zod; on failure, one repair retry ("Your previous output failed validation: <errors>. Return corrected JSON only."); second failure → degraded path + admin flag.
3. Every stored artifact records `model` + `prompt_version` (+ `rubric_version` where relevant).
4. Locale-aware prompts receive `locale` + the locale style note (zh-TW craft rules from UX_PRINCIPLES.md). Generation is native, not translated.
5. Never put user PII in system prompts or logs. Never promise outcomes in generated text (rule injected into report/email prompts).

## Registry
| ID | Purpose | Model | Temp | Input | Output schema |
|---|---|---|---|---|---|
| `profile_extraction.v1` | source material → ExtractedProfile | claude-sonnet-4-6 | 0.2 | raw text or PDF doc block + input_type + taxonomy slug lists | `ExtractedProfileSchema` |
| `dimension_scoring.v1` | profile (+answers) → 14 scores | claude-sonnet-4-6 | 0.2 | profile JSON + rubric anchors + answers | `DimensionScoresSchema` |
| `mri_report.v1` | profile + scores + category → 12 sections, native locale | claude-sonnet-4-6 | 0.5 | profile, bands, category copy, evidence_assets, hard-exclusion list, word caps, locale style note | `ReportSectionsSchema` (each section: body + evidence_ref) |
| `admin_summary.v1` | session → 6-line EN summary (+ zh on demand) | claude-haiku-4-5 | 0.3 | profile + scores + category | `AdminSummarySchema` |
| `teardown_memo.v1` | paid prep: draft memo for Michael | claude-sonnet-4-6 | 0.4 | full session bundle | `MemoDraftSchema` (sections: read, gaps, angle, talking points, questions to ask) |
| `followup_email.v1` | D0/D2/D6 personalized drafts | claude-haiku-4-5 | 0.5 | template (locale) + profile highlights + category | `EmailDraftSchema` |
| `translation.v1` | ad-hoc admin translation only | claude-haiku-4-5 | 0.2 | text + target locale | `{ text }` |

## Critical prompt rules by prompt
- **profile_extraction:** no invention; PII exclusion; evidence_assets ≤25 words each, themed; taxonomy slugs only (else free_text); confidence per group; missing_fields from the known question-bank ID list.
- **dimension_scoring:** must cite evidence per score; confidence < 0.4 when guessing; rubric anchors are the law — no vibes scoring.
- **mri_report:** specificity contract (≥1 evidence_ref per section); the 10 hard exclusions verbatim; word caps; one honest criticism in `core_story_gap`; bands not numbers; limited-data framing flag; no guarantees.
  - `international_positioning` (v3+): three layers in one flowing body — (1) which market the profile reads strongest in + the one marker why, (2) one rewritten self-description sentence for that market cued by "你可以這樣說："/"You could put it this way:" (a draft, never quotation-marked since it is not verbatim), (3) one doable-now strengthening move cued by "下一步："/"One move:". No relocation plan, no multi-step plan.
- **teardown_memo:** drafted FOR Michael, candid, may include what the free report withheld.
- **followup_email:** template skeleton from `emails.ts`; model only personalizes the variable lines; ≤120 words.

## Cost per free MRI (list prices: Sonnet 4.6 $3/$15, Haiku 4.5 $1/$5 per MTok)
extraction ~7k in/1.5k out + scoring ~5k in/1k out + report ~6k in/2.5k out (Sonnet) + summary ~3k in/0.5k out (Haiku) ≈ **US$0.13–0.18 per completed MRI**. Acceptable; rate-limited per ARCHITECTURE.md. Re-runs reuse stored extraction.

## Eval discipline
8 golden seed inputs (Phase 4) stored in `tests/fixtures/`; any prompt version bump reruns them and diffs category + section presence. Manual quality read by Michael for zh-TW outputs.
