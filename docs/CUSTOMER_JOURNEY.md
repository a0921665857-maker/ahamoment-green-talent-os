# CUSTOMER_JOURNEY.md

## Funnel (V1)

| # | Step | Screen / component | User state | System action | Churn risk → mitigation | Event |
|---|------|--------------------|-----------|---------------|--------------------------|-------|
| 1 | Arrive | Landing (`/{locale}` or `/` → detect) | Curious, skeptical | Locale detect (Accept-Language) with visible switcher | Looks like agency/guru → calm premium tone, founder strip, no hype | `page_view` |
| 2 | Choose language | `LanguageSwitcher` | Orienting | Persist locale in URL + cookie | Wrong language guess → switcher always visible top-right | `language_selected` |
| 3 | Start MRI | CTA → `/{locale}/mri` | Half-committed | Explain the 4 input options + time promise ("~5 minutes, free") | Fear of long form → show "3 steps" indicator | `mri_started` |
| 4 | Pick input method | `SourceMaterialInput` tabs | Deciding effort level | Tabs: CV PDF / LinkedIn paste / Notes or AI-chat paste / Voice transcript paste. Mobile: paste tabs first | Mobile PDF pain → paste-first ordering on mobile | `input_method_selected` |
| 5 | Consent | `ConsentBox` (inline, before submit) | Cautious | Required checkbox (processing) + optional checkbox (anonymized aggregate). Plain language, both locales | Scary legalese → calm copy per PRIVACY_AND_CONSENT.md; "redact freely" hint | `consent_given` |
| 6 | Submit material | same screen | Committed | Validate min length (≥150 chars EN / ≥80 zh, or PDF ≤10MB); store raw; call extraction | Garbage/too-short input → friendly "add a bit more" block, examples shown | `material_submitted` |
| 7 | Extraction wait | staged progress | Waiting | Honest stages, target <60s | Spinner anxiety → named stages, no fake % | `extraction_succeeded` / `extraction_failed` |
| 8 | Confirm understanding | `ProfileConfirmation` | Surprised (good) | Show extracted profile summary in user's locale; inline edits allowed | Wrong extraction → editable fields; edits stored as `user_edits` | `profile_confirmed` |
| 9 | Missing questions + email | `MissingQuestions` + email field | Invested | 3–5 questions from bank (deterministic selection); email required, framed "where should we send your report?"; name optional | Email gate friction → value is imminent, framing is service not capture. Measure drop here | `questions_submitted` |
| 10 | Report generation | staged progress | Anticipating | Score (LLM) → classify (deterministic) → report (LLM, native locale); <90s | Timeout → degraded fallback report + admin flag | `report_generated` |
| 11 | Read report | `MRILiteReport` at `/{locale}/result/[token]` | Evaluating | 12 sections, bands not numbers, ≥1 personal specific per section | Generic feel → specificity contract in prompt; limited-data framing if low confidence | `report_viewed` |
| 12 | Paid CTA | `PaidOfferCTA` | Considering | 1 primary offer (by category) + Teardown entry + Full Package anchor; Calendly link; credit policy shown | Pushy feel → diagnostic-led copy ("based on your MRI, the highest-leverage next step is…") | `cta_clicked` |
| 13 | Book / leave | Calendly (placeholder) | Decided | Admin notified via dashboard; follow-up drafts generated | Silent exit → D2/D6 follow-up emails (manual send in V1) | `booking_clicked` |

## Key journey decisions (binding)
1. **Email gate at step 9**, not before input (kills starts) and not after report (kills capture). Framed as delivery, not capture. Report is still shown immediately on-screen.
2. **Consent is inline at the submit step**, not a separate page — one decision per screen, but consent must be actively checked before the submit button enables.
3. **Report URL is an unguessable token** (`/result/[token]`). User can return to it; no account needed. Privacy tradeoff documented in KNOWN_LIMITATIONS.md.
4. **Return visits:** token stored in localStorage; landing shows "view your report" if present.
5. **Abandonment:** sessions with email but no report (rare) or report but no CTA click appear in the admin follow-up queue.

## Admin journey (Michael)
Dashboard list (newest first, lead grade A→C) → open lead → source material, extracted profile + confidence, edits, answers, score breakdown, category, report, EN/zh summaries, memo draft → mark follow-up status → send follow-up (manual in V1, draft provided) → mark paid.

## Instrumentation
All events above written to the `events` table (no third-party analytics in V1). Funnel query lives in MAINTENANCE_GUIDE.md.
