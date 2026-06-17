# PAID_OFFER_STRATEGY.md

## Offer ladder
| ID | Offer | Price (placeholder, USD) | Delivery | Michael-hours | For whom |
|---|---|---|---|---|---|
| `teardown_90` | 90-Minute Story Teardown | 249 | 90-min call + written memo within 72h | ~2.0 (AI memo draft) | universal entry point |
| `cv_linkedin_review` | CV & LinkedIn Review | 249 | async review + 30-min call | ~2.0 | strong story, weak documents |
| `climate_positioning_sprint` | Climate Career Positioning Sprint | 800–1,500 | 3 sessions / 3 weeks | ~6 | direction-confused, non-MBA-first |
| `mba_story_sprint` | One-School MBA Story Sprint | 1,200–2,000 | 4 sessions / 4 weeks | ~8 | clear school target |
| `mock_interview_pack` | AI + Human Mock Interview Pack | 300–800 | AI reps + 1–2 live mocks | ~2–4 | interview-stage users |
| `full_package` | Full Green Career / MBA Positioning Package | 3,000–5,000 | 8 weeks end-to-end | ~16 | committed, funded |

**Credit policy (binding):** Teardown fee credits 100% toward any sprint/package booked within 30 days. Stated at CTA.

## Presentation rule (binding)
Report CTA shows exactly three: the category's **primary offer**, `teardown_90` as the low-risk entry, `full_package` as the anchor. Landing page may list all six. If primary IS the teardown, show teardown + the category's secondary + anchor.

## Category → offer mapping (consumed by classifier; edit here AND in `scoreWeights.ts`)
| Result category | Primary | Secondary overlay |
|---|---|---|
| `ready_for_mba_story_sprint` | `mba_story_sprint` | — |
| `strong_profile_weak_story` | `teardown_90` | `cv_linkedin_review` if cv_readiness ≤ 2 |
| `climate_career_first_mba_later` | `climate_positioning_sprint` | — |
| `career_positioning_before_mba` | `climate_positioning_sprint` | `teardown_90` |
| `profile_building_needed` | `teardown_90` (framed as optional; honest "build first" guidance is the headline) | — |
| `high_potential_low_commercial_clarity` | `climate_positioning_sprint` | `teardown_90` |
| `interview_ready_positioning_weak` | `teardown_90` | `mock_interview_pack` |
| `cv_strong_narrative_weak` | `teardown_90` | — |
| Overlay rule (any category) | — | `mock_interview_pack` if interview_readiness ≤ 2 and user timeline ≤ 6 months |

## CTA copy principles
Diagnostic-led ("Your MRI shows X; the highest-leverage next step is Y"), one CTA button (Calendly placeholder), credit policy line, confidentiality line ("human review is private; your materials are never used as examples without permission"), no urgency theatrics. Copy lives in `paidOffers.ts` per locale.

## Lead grading (admin queue priority)
- **A:** timeline ≤ 6 months AND mid-level+ seniority AND category ∈ {1,2,4,6,7,8}
- **B:** timeline ≤ 12 months, or strong scores with vague timeline
- **C:** everything else (nurture; no manual follow-up effort in V1)
Computed deterministically at classification time; stored on session.

## Capacity reality (solo, employed)
~4–6 client-hours/week ⇒ sustainable mix ≈ 2 teardowns/wk + 1 sprint running, ceiling ≈ US$2–5k/month. The funnel must therefore optimize for lead QUALITY (grading) over volume. Raise prices before raising volume.

## Follow-up sequence (manual send in V1; drafts auto-generated)
- D0: report-delivery email (template + personalized line).
- D2: one extra insight pulled from their profile ("one more thing your CV shows…") + soft CTA.
- D6: category-specific case note + final CTA. Stop after D6. All templates in `emails.ts` per locale.
