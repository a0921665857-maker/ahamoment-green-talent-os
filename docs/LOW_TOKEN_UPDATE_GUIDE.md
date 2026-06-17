# LOW_TOKEN_UPDATE_GUIDE.md

> Audience: a cheap model doing a small change. Load ONLY this file + the files named in the recipe. Do not load other docs unless the recipe says so. After ANY change: `npm test && npm run build`. If either fails and the fix isn't obvious in one step, revert and report.

## Global do-not-touch list
`lib/types.ts` zod schemas · `resultClassifier.ts` rule ORDER · `supabase/schema.sql` existing columns · anything in `app/api/` unless the recipe targets it · key NAMES in content files (values only) · stored data.

## Recipes
**1. Change landing page copy** — open `content/en/landing.ts` and `content/zh-TW/landing.ts`; edit VALUES only, keep keys; both locales must change together (build fails otherwise — that's the test working).

**2. Add a diagnostic question** — add an entry with a new stable `id` (e.g. `q_team_size`) to `content/en/questions.ts` AND `content/zh-TW/questions.ts` (same id/option values, localized labels); register the id + its trigger condition in `lib/extraction/missingInfoDetector.ts` priority list. Never reuse or rename an existing id.

**3. Change score weights** — edit numbers in `lib/scoring/scoreWeights.ts` only; weights per index must sum to 1.0; run tests (golden fixtures will tell you if categories shifted — if shifts are intended, update expected values in `tests/resultClassifier.test.ts` and say so in CHANGELOG.md).

**4. Add a result category** — add key to the category union in `lib/types.ts`; add copy block in BOTH `content/{locale}/results.ts`; add offer mapping row in `content/{locale}/paidOffers.ts` mapping; add ONE rule in `resultClassifier.ts` at the explicitly stated priority position; add a test case. Five files, no more.

**5. Edit a report section** — title/order/fallback: `content/{locale}/reportTemplates.ts`. Generation behavior: `lib/prompts/mriReport.ts` (bump `version`). Never edit stored reports.

**6. Add a paid offer** — add to `content/{locale}/paidOffers.ts` (id, name, price, description, CTA) in both locales; reference it from a category mapping or overlay; CTA component reads config, needs no change.

**7. Add an SEO page** — create `app/[locale]/guides/[slug]/page.tsx` content entry per the pattern in that folder's README comment; add metadata to `content/{locale}/seo.ts`; sitemap picks it up from the routes list.

**8. Add a language** — follow the 6-step recipe in BILINGUAL_CONTENT_SYSTEM.md (the one doc you may load for this). Build fails until every content file exists with every key.

**9. Modify a prompt** — edit only the target file in `lib/prompts/`; bump `version`; do NOT change its `outputSchema` (that's a types change, out of scope for cheap edits); run tests; note in CHANGELOG.md.

**10. Debug common issues** — Report generic? → check `evidence_assets` count in the lead's extracted profile (admin detail). Wrong category? → reproduce the score vector in `tests/`, trace which rule fired; adjust weights (recipe 3), not rule order. zh output stiff? → check locale style note in the prompt file. Submit button dead? → consent checkbox state or min-length validation. LLM JSON errors spiking? → check CHANGELOG for a recent prompt bump; revert version.

**11. Run tests** — `npm test` (scoring, classifier, content-schema completeness) then `npm run build`. Both green before any commit.

**12. What not to touch** — see global list above; additionally never delete migrations, never log PII, never weaken the consent gate, never expose raw scores to users.
