import { notFound } from 'next/navigation';

/**
 * Catch-all whose only job is to fail. Next resolves an unmatched URL against
 * the ROOT not-found, which lives outside this route group and therefore
 * outside the locale layout — so /zh-TW/no-such-page used to render an English
 * page with no <html lang>, no header and no footer.
 *
 * Calling notFound() from inside the [locale] segment moves the 404 into that
 * segment's boundary, which is app/(site)/[locale]/not-found.tsx: correct lang,
 * the shared header, and the footer sitemap under it. The status code is still
 * 404 — notFound() sets it.
 *
 * Route specificity keeps this harmless: static segments and named dynamic
 * segments (types/[category], result/[token], twin/[token]) both outrank a
 * catch-all, so this only ever runs for URLs that genuinely match nothing.
 *
 * No generateMetadata here on purpose: Next discards a page's metadata once
 * notFound() is thrown and falls back to the layout's title. It does inject
 * <meta name="robots" content="noindex"> on the 404 response by itself, which
 * is the part that actually matters for crawlers.
 */
export default function UnmatchedLocalePath(): never {
  notFound();
}
