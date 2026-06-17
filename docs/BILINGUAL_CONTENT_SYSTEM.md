# BILINGUAL_CONTENT_SYSTEM.md

## Goal
Add a third language (ja, id) by adding files — zero component changes. No user-facing string ever lives inside a component.

## Structure
```
content/
  locales.ts            # registry: [{ code:'en', label:'English' }, { code:'zh-TW', label:'繁體中文' }]
  schema.ts             # TypeScript types every locale must satisfy (single source of truth)
  en/      landing.ts questions.ts results.ts reportTemplates.ts paidOffers.ts consent.ts seo.ts errors.ts emails.ts
  zh-TW/   (same nine files, same keys)
```
- `schema.ts` exports interfaces (`LandingContent`, `QuestionBank`, …). Each locale file is `const landing: LandingContent = {...}` — TypeScript fails the build if a key is missing. This typecheck IS the i18n test.
- Key naming: `page.section.element` semantics via nested objects, e.g. `landing.hero.title`, `consent.processing.label`, `results['strong_profile_weak_story'].risk`.
- Components receive content via a `getContent(locale)` helper; never import a locale file directly.

## What is config vs what is generated
| Content | Source | Rationale |
|---|---|---|
| All UI copy, buttons, errors, SEO meta | locale config | stable, editable, low-token |
| Question bank (text + options) | locale config | deterministic selection needs stable IDs |
| Result-category copy (explanation, risk, next move, CTA) | locale config | the 8 categories are product voice, not model output |
| Report section bodies | LLM, generated natively in user's locale | must be personal/specific |
| Report section titles | locale config (`reportTemplates.ts`) | layout stability |
| Admin English summary | LLM (Haiku), always EN | Michael scans in one language |
| Emails/follow-ups | locale config templates + LLM-personalized draft | speed + voice control |

## Locale handling rules
- Routing: `app/[locale]/...`; middleware redirects `/` by Accept-Language with cookie override; locale codes exactly `en` and `zh-TW`.
- User's locale stored on the session row; all generation prompts receive `locale` and a one-line style note (from UX_PRINCIPLES zh rules).
- Reports are **generated natively**, never machine-translated. Translation prompt exists only for ad-hoc admin needs.
- Taxonomy terms carry `label_en` + `label_zh` (see DATA_MODEL); report prompts receive localized labels.

## Adding a language (recipe — mirrored in LOW_TOKEN_UPDATE_GUIDE.md)
1. Add code to `content/locales.ts`.
2. Copy `content/en/` → `content/<code>/`; translate values, never keys. Build fails until complete.
3. Add taxonomy labels for the locale.
4. Add the locale style note used by prompts.
5. Add hreflang + sitemap entries (automatic if driven by `locales.ts`).
6. Run seed-profile QA in the new language (Phase 4 procedure).

## QA checklist per locale
Hero reads native; consent reads calm; question options unambiguous; result categories reviewed by a native speaker; report of one seed profile reviewed end-to-end; punctuation/typography rules pass.
