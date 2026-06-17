# SCORING_MODEL.md

## Pipeline (binding)
1. **LLM scores** each dimension 1–5 with evidence + confidence (Sonnet, JSON, rubric anchors injected).
2. **Deterministic classifier** (`resultClassifier.ts`, pure TS, unit-tested) maps scores + intent + confidence → result category + offers. The LLM never picks the category.
3. Weights and thresholds live in `scoreWeights.ts` (config, not logic). Rubric anchors live in `lib/scoring/rubrics.ts` and are versioned (`rubric_version`).

## 14 dimensions — definition and rubric poles (1 ↔ 5)
> Anchors below are v0.1, written to be refined by Michael — they are the product IP. One line per dimension: what 1 means ↔ what 5 means.

| Dim (key) | 1 = | 5 = |
|---|---|---|
| career_clarity | cannot state what they want next | one-sentence target role/sector/timeline, internally consistent |
| green_economy_fit | aspiring, no green-economy exposure | core operator in a taxonomy sector with named domain work (e.g., SBTi, CBAM, VCM) |
| mba_readiness | <2 yrs exp, no leadership/impact evidence, vague why-MBA | 4–8 yrs, progression, credible why-now, profile an adcom can place |
| climate_career_fit | interest only | demonstrated transferable skills + realistic target lane in climate |
| leadership_proof | no evidence of leading anything | led teams/initiatives with scope and named outcomes |
| impact_evidence | activity described, no outcomes | quantified outcomes (tCO2e, $, %, scale) attributable to them |
| commercial_credibility | impact framed as compliance/virtue only | speaks in revenue, cost, risk, client terms; owned a number |
| differentiation | interchangeable with any ESG consultant CV | a combination (sector × geography × skill) few others have, evidenced |
| role_fit | target role mismatched to evidence | evidence maps cleanly to target role's hiring bar |
| school_fit | no realistic school logic (only if mba_intent ≠ no) | target program matches profile strength and goal logic |
| international_positioning | experience reads local-only | cross-border work/clients/markets, travels well to global employers |
| story_risk (inverted: 5 = low risk) | gaps/jumps/contradictions unexplained | trajectory coheres; transitions have reasons |
| interview_readiness | cannot narrate their own CV | crisp STAR-able stories likely available on demand |
| cv_readiness | walls of duties, no structure | achievement-led, quantified, scannable, right length |

Scoring call also returns `confidence` per dimension; dimensions with confidence < 0.4 are excluded from weighted aggregates and shown as "not enough signal" in admin.

## Weights (`scoreWeights.ts` v0.1)
Three composite indices (weighted means):
- **story_index** = .30 career_clarity + .25 differentiation + .25 story_risk + .20 commercial_credibility
- **mba_index** = .35 mba_readiness + .25 leadership_proof + .20 impact_evidence + .20 international_positioning
- **climate_index** = .40 green_economy_fit + .35 climate_career_fit + .25 role_fit
Bands (user-facing): 1.0–2.4 Emerging · 2.5–3.7 Developing · 3.8–5.0 Strong.

## Classifier v0.1 — priority-ordered rules (first match wins)
Inputs: 14 scores, story_index/mba_index/climate_index, `mba_intent`, `overall_confidence`, `timeline`.
```
R0 overall_confidence < 0.45 OR avg(score) < 2.0        → profile_building_needed
R1 mba_intent ∈ {active}  AND mba_index ≥ 3.8 AND story_index ≥ 3.3
                                                        → ready_for_mba_story_sprint
R2 mba_intent ∈ {active,considering} AND mba_index ≥ 3.3 AND story_index < 3.0
                                                        → career_positioning_before_mba
R3 mba_intent ∈ {considering,later} AND climate_index ≥ 3.3 AND mba_index < 3.3
                                                        → climate_career_first_mba_later
R4 cv_readiness ≥ 4 AND story_index < 3.0               → cv_strong_narrative_weak
R5 interview_readiness ≥ 4 AND story_index < 3.0        → interview_ready_positioning_weak
R6 avg(top5 scores) ≥ 3.5 AND commercial_credibility ≤ 2.5
                                                        → high_potential_low_commercial_clarity
R7 avg(score) ≥ 3.3 AND story_index < 3.0               → strong_profile_weak_story
R8 fallback: mba_intent ∈ {active,considering} → career_positioning_before_mba
             else                              → climate_career_first_mba_later
```
Then apply offer mapping + secondary overlays from PAID_OFFER_STRATEGY.md, and compute lead_grade. `classifier_version` stored with every result.

## Result-category copy
Each of the 8 categories has, per locale (in `content/{locale}/results.ts`): plain-language explanation · why it matters · main risk · recommended next move · suggested paid offer line · CTA copy. Static config — never LLM-generated.

## Testing requirements (Phase 3/4 gate)
- Unit tests: every rule fires on a synthetic score vector; fallback covered; overlay rules covered; band boundaries covered.
- Golden profiles (8 seeds, see ROADMAP/Phase 4): expected category asserted per seed; changing weights must rerun `npm test` (recipe in LOW_TOKEN_UPDATE_GUIDE.md).
- Calibration note: v0.1 thresholds are priors; after ~30 real sessions, review admin disagreements and tune `scoreWeights.ts` only (never the rule order without re-running golden tests).
