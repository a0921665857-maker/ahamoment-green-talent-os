import { localeRegistry } from '@/content/locales';
import type { Locale } from '@/lib/constants';

/**
 * Per-page canonical + hreflang.
 *
 * A bilingual site shipped zero rel=canonical and zero hreflang, so every zh-Hant
 * page and its en twin looked to a crawler like two untranslated duplicates. The
 * data to fix it already existed and was dead: content/locales.ts has carried an
 * `hreflang` field ('en' / 'zh-Hant') that nothing read.
 *
 * This lives per page rather than in the layout on purpose. `alternates` set on a
 * layout is inherited by every page under it, which would canonicalise all 20-odd
 * routes onto the locale root — worse than having none. The pathname is only
 * knowable at the page, so the page passes it.
 *
 * `path` is the locale-relative route with a leading slash, or '' for the home
 * page — the same shape app/sitemap.ts uses, so the two can never disagree.
 */
export function alternatesFor(locale: Locale, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: Object.fromEntries(localeRegistry.map((l) => [l.hreflang, `/${l.code}${path}`])),
  };
}
