# SEO_STRATEGY.md

## Honest channel sequencing
- **V1 (now):** distribution = Michael's existing Threads + Ghost audience (zh-TW) and direct LinkedIn outreach (EN). SEO ships as *architecture*, not pages.
- **V2 (after first paid customers):** publish pillar pages; SEO becomes the compounding channel. Do not write 30 SEO pages before product-market signal — that is procrastination with extra steps.

## Architecture shipped in V1 (binding)
- `app/[locale]/` routes; `en` and `zh-TW`; hreflang pairs (`en`, `zh-Hant` + `x-default`) on every page.
- All metadata (title/description/OG) from `content/{locale}/seo.ts`.
- Per-locale sitemap generated from `locales.ts` + a routes list; robots.txt.
- Reserved route: `/{locale}/guides/[slug]` (MDX or DB-driven later) — exists as structure, ships empty.
- Clean semantic HTML on landing (h1/h2 hierarchy), fast LCP (no heavy hero media), JSON-LD (Organization + Service) added in V1.1.

## Domain decision (OPEN — Michael decides; placeholder fine for build)
Recommendation: keep one brand. Either `ahamoment.<tld>/mri` paths or `mri.ahamoment.<tld>` subdomain, cross-linked with the Ghost blog (the blog is the content engine; the app is the converter). Avoid a brand-new orphan domain with zero authority unless repositioning the brand. Decide before beta launch; affects nothing in the codebase except env `NEXT_PUBLIC_SITE_URL`.

## Future page map (V2 backlog — 5 pillars per locale first)
| EN pillar | zh-TW pillar |
|---|---|
| MBA for sustainability professionals (hub) | 永續 MBA 申請完整指南（hub） |
| Climate / ESG career transition guide | ESG 顧問轉職路線圖 |
| Carbon market careers explained | 碳市場職涯與機會 |
| Singapore & APAC green careers | 新加坡永續工作市場 |
| Sustainability CV & interview prep | 永續履歷與 ESG 面試準備 |
Each pillar later spawns cluster pages from the keyword lists in the brief (kept verbatim in this repo's brief; do not keyword-stuff the landing page now). Every guide ends with the MRI CTA.

## zh-TW specifics
Taiwanese audience searches Google; phrasing matters more than volume tools suggest (write for 永續圈 insiders, not literal keyword strings). Threads posts → guide pages → MRI is the realistic funnel; Ghost articles should canonically link to the new pillar pages once they exist, not duplicate them.

## Measurement
Google Search Console for both hostname variants from day 1; the `events` table covers conversion; no extra analytics tooling in V1.

## Do-not list
No doorway pages, no auto-translated content, no AI-spam programmatic pages, no separate "SEO blog" duplicating Ghost.
