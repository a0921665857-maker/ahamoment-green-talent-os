# DESIGN_REVIEW_PHASE1.md

> Status: HISTORICAL RECORD of the Phase 1 brutal review. The adopted changes are already folded into the Phase 2 docs. Maintenance models do NOT need to load this file.

Format per perspective: **Risk found → Design change adopted (✅ = binding decision).**

## 1. User experience — where will users churn?
- Risk: the dead zone between "upload" and "report" (waiting, forms, confusion).
- ✅ Staged, honest progress UI with real stages ("Reading your CV… Mapping your green-economy experience…"), target <60s extraction, <90s report.
- ✅ One decision per screen. Confirmation page shows what we understood (trust moment), editable inline.
- Risk: voice recording in-browser is high friction + transcription cost.
- ✅ V1 voice = paste a transcript only. In-browser recording deferred to V1.1 (see ROADMAP).
- Risk: mobile users (Threads/LinkedIn referrals) can't easily upload PDFs.
- ✅ Mobile-first paste flows; LinkedIn-paste and notes-paste are the visually primary options on mobile.

## 2. Paid conversion — what makes users pay?
- Risk: 6 offers in the report = choice paralysis.
- ✅ Report shows max 3: ONE primary offer (mapped from result category), the 90-Min Story Teardown as universal entry point, and the Full Package as price anchor.
- ✅ Teardown fee (USD 249) credits toward any sprint/package booked within 30 days. Reduces purchase risk.
- Risk: generic report = no conversion. Specificity IS the sales pitch.
- ✅ Extraction captures `evidence_assets` (quotable specifics from the user's own material); every report section must reference at least one. Enforced in the report prompt contract.
- ✅ Trust play: category "Profile Building Needed" recommends the cheapest path (or none). Honest downsell builds credibility and referrals.

## 3. Investor — what makes this bigger than consulting?
- Risk: report generator + Calendly = consulting with extra steps.
- ✅ Controlled taxonomy (sectors / functions / skills / credentials with stable slugs) from day 1. Free-text tags can never become a talent graph; slugs can.
- ✅ Every MRI run produces a normalized `ExtractedProfile` — the graph node precursor (see TALENT_GRAPH_SCHEMA.md).
- ✅ Separate, optional consent checkbox for anonymized aggregate insights → enables future "State of APAC Green Talent" data products.

## 4. Engineering — what becomes hard to maintain?
- Risk: prompt sprawl, copy sprawl, LLM output drift.
- ✅ All copy in `content/{locale}` config files with stable keys, typed against one shared schema.
- ✅ All LLM calls: versioned prompts + zod-validated JSON output + one repair retry + degraded-mode fallback flagged to admin. No free-form LLM output enters the system.
- ✅ LLM never classifies the result category. It extracts and scores; a deterministic, unit-tested TypeScript classifier picks the category. Same for missing-question selection (deterministic pick from a question bank).
- ✅ PDF parsing: send the PDF directly to the Claude API as a document block. No PDF-parser dependency to maintain.

## 5. AI cost — what runs on what?
- ✅ Quality-critical (extraction, report): claude-sonnet-4-6. Cheap paths (admin summaries, memo/follow-up drafts): claude-haiku-4-5. Estimated COGS ≈ US$0.10–0.20 per free MRI (see ARCHITECTURE.md cost table).
- ✅ Abuse protection: per-IP rate limit on generate endpoints + max input size (40k chars / 10MB PDF). One bot loop could otherwise burn real money.
- ✅ Extraction results cached in DB; retries never re-pay for extraction.

## 6. Privacy — why would users hesitate to upload?
- Risks: CVs contain phone/address; AI chat histories contain very personal content; fear of data reuse.
- ✅ "Redact freely" hint at paste/upload step ("feel free to remove names or contact details — the analysis works without them").
- ✅ PII minimization: extraction never copies phone/address/personal email into the stored profile.
- ✅ Raw source material auto-purged after 90 days; structured profile kept until deletion request; deletion within 7 days; no model training on user data — all stated in consent copy.
- ✅ Voice: we store transcripts only, never audio, in V1.

## 7. SEO — long-term bilingual organic traffic?
- Risk: retrofitting i18n routing is the single most painful migration in Next.js.
- ✅ `app/[locale]/` route structure from day 1, hreflang pairs, per-locale sitemap, all metadata from content config. V1 ships only landing + privacy pages, but `/{locale}/guides/[slug]` is reserved.
- ✅ Distribution insight: zh-TW traffic will initially come from Michael's existing Threads/Ghost audience, not Google. SEO_STRATEGY.md treats Threads→landing as the V1 channel and SEO as the V2 compounding channel.

## 8. Platform — talent graph, not report generator?
- ✅ Data model separates raw → extracted (canonical) → scores → outcomes, so reports are derived artifacts, not the asset. The asset is the profile corpus.

## 9. Solo founder — automate vs human?
- Constraint: Michael has a full-time job; ~4–6 client-hours/week. Calendar, not demand, is the ceiling.
- ✅ Automated: extraction, report, admin summaries, memo DRAFTS, follow-up email DRAFTS. Human-only: teardown calls, final memos, pricing conversations.
- ✅ Lead quality grade (A/B/C) computed from timeline urgency + seniority + category, so admin queue surfaces the best leads first.
- ✅ Two missing-info questions are always asked because they double as qualification signals: target move and timeline.

## 10. Differentiation — why not a generic AI career tool?
- ✅ The IP is the rubric anchors: 14 scoring dimensions with level descriptions encoding real ESG/carbon/MBA hiring judgment (Michael's Big 4 + INSEAD + climate SaaS experience). They live as editable config, are injected into prompts, and are versioned.
- ✅ Bilingual native generation (not translation), APAC green-economy taxonomy, and a human escalation path — none of which Teal/Kickresume/raw ChatGPT offer.

## 11. Customer trust — why believe this is credible?
- ✅ Founder strip on landing (Big 4 ESG → INSEAD → carbon-markets SaaS, bilingual) — specific, not motivational.
- ✅ The confirmation page is the credibility engine: "it actually read my CV." Bands (Emerging / Developing / Strong) instead of fake-precise numeric scores.
- ✅ No guarantees of admission/salary/offers, ever (also a privacy/compliance rule).

## 12. Report design — value without giving away the paid product?
- ✅ Boundary rule: free report names the WHAT (diagnosis, gap, direction) never the HOW (rewrites, scripts, plans, school lists). Per-section word caps (~80–120 EN words). The 10 exclusions from the brief are injected into the report prompt as hard constraints.
- ✅ "Screenshot test": each section should contain one line a user would screenshot and share.

## 13. Data quality — weak/messy uploads?
- ✅ Minimum input threshold (~150 chars EN / ~80 chars zh) with a friendly "give us a bit more" block.
- ✅ Field-group confidence from extraction; overall confidence <0.5 → ask up to 5 questions (instead of 3) and render the report in "limited-data" framing; very low data → category forced to "Profile Building Needed".
- ✅ Confirmation page lets the user correct extraction errors before scoring — hallucination safety valve.

## 14. Internationalization — avoid rebuilding for language 3?
- ✅ Adding a language = add `content/{locale}` folder + register locale + add taxonomy labels + QA. Zero component changes. Documented as a recipe in LOW_TOKEN_UPDATE_GUIDE.md.
- ✅ Reports generated natively in the user's locale; English admin summary generated separately on Haiku. Result-category copy is static config (stable, editable), not LLM output.

## Founder-level risk surfaced (outside product scope, must not be ignored)
- Michael is in Singapore on an Employment Pass. EP holders generally may not run a side business or earn income outside their sponsoring employer without authorization (e.g., MOM Letter of Consent), and employer contracts often have moonlighting/IP clauses. **Verify the legal structure for charging customers before taking the first payment.** Logged in KNOWN_LIMITATIONS.md. Not legal advice; needs a professional answer.
