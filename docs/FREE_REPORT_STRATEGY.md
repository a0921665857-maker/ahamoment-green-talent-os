# FREE_REPORT_STRATEGY.md

## Job of the free report
Make the user feel: "this actually understood my background, it's sharper than any quiz, and I want Michael to take me deeper." It diagnoses (WHAT) and points (WHERE NEXT); it never delivers the work (HOW).

## Rendering model
The report is structured JSON: `{ sections: { [sectionKey]: { body, evidence_ref } }, bands: {...}, category, primary_offer }` rendered into a fixed layout from `reportTemplates.ts`. Never one LLM blob — enables consistent design, per-section regeneration, and locale independence.

## The 12 sections (order, caps ≈ 80–120 EN words / 140–220 zh characters each)
| Key | Goal | Must contain | Must NOT contain |
|---|---|---|---|
| `current_positioning` | Mirror them precisely | 1-sentence positioning statement + the lens they're currently seen through | rewrite of their pitch |
| `hidden_strengths` | The "aha" | 2–3 strengths with evidence quotes from their material | full strengths inventory |
| `underused_story_assets` | Show unmined gold | 2 concrete assets (project, number, transition) + why each is underused | how to deploy them |
| `core_story_gap` | The honest cut | THE one gap, named plainly | the fix |
| `green_career_fit` | Direction | best-fit sector lane(s) from taxonomy + band | target company list |
| `mba_readiness` | Calibration | band + the single biggest readiness driver | school strategy / list |
| `commercial_clarity` | B4/NGO blind spot | band + one line on how commercially their impact reads | salary benchmarks |
| `international_positioning` | Global lens | band + one line on how the profile travels (APAC→global) | relocation plan |
| `interview_readiness` | Snapshot | band + the one question type they'd struggle with | sample answers |
| `cv_readiness` | Snapshot | band + the one structural issue | rewritten bullets |
| `recommended_next_move` | Single next step | one move, one paragraph, doable in 2 weeks | 90-day plan |
| `suggested_paid_next_step` | Bridge | why the primary offer fits THIS diagnosis (from category copy) | discounts, pressure |

## Hard exclusions (injected verbatim into the report prompt)
No full CV rewrite, full LinkedIn rewrite, essay outline, interview answers, school strategy, salary benchmarks, target company lists, 90-day plans, application strategy, negotiation scripts. No admission/salary/offer guarantees.

## Specificity contract (the conversion mechanism)
Every section body must reference ≥1 item from `extracted_profile.evidence_assets` (a quote/number/project from the user's own material). The prompt requires it; the zod validator checks `evidence_ref` is non-empty; a section failing twice renders the template's neutral fallback line and flags admin. **Screenshot test:** each section should contain one line worth screenshotting.

## Bands
Score 1.0–2.4 → Emerging（萌芽）· 2.5–3.7 → Developing（發展中）· 3.8–5.0 → Strong（紮實）. Raw numbers never shown to users.

## Limited-data mode
If overall extraction confidence < 0.5 after questions: prepend a calm framing line ("based on the material provided…"), suppress `interview_readiness` and `cv_readiness` bands (show "not enough signal yet"), and bias category toward `profile_building_needed`. Never fabricate confidence.

## Tone
Direct, warm, consultant-grade. One honest criticism minimum (`core_story_gap`) — flattery-only reports don't convert and don't deserve to.
