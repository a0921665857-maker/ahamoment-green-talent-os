'use client';

import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/constants';
import { notFoundCopy } from '@/content/notFound';

/**
 * The locale-scoped 404: the boundary for a route that EXISTS but whose content
 * does not — types/[category] with an unknown category, result/[token] and
 * twin/[token] with a token that resolves to nothing. It renders inside
 * app/(site)/[locale]/layout.tsx, so it keeps the right <html lang>, the header
 * and the footer sitemap: a fork in the road rather than a dead end.
 *
 * It deliberately does NOT cover unmatched URLs. A catch-all page that threw
 * notFound() used to route those here, and it cost more than it bought: Next
 * renders any RUNTIME notFound() through its error path, which ships
 * <html id="__next_error__"> with an empty <body> and puts the page only in the
 * RSC payload. A reader without JS went from seeing a one-line English 404 to
 * seeing a blank page. Unmatched URLs now fall through to the prerendered root
 * app/not-found.tsx, which is real server-rendered markup with a real title.
 * The empty-shell behaviour still applies to the three routes above — that is
 * Next's, not ours, and it predates this file.
 *
 * Client component because not-found.tsx receives no params: the locale has to
 * come from the path. Reading it here rather than from a header keeps this
 * inside the app router and leaves proxy.ts alone.
 */
export default function LocaleNotFound() {
  const pathname = usePathname() ?? '';
  const first = pathname.split('/')[1] ?? '';
  const locale: Locale = (LOCALES as readonly string[]).includes(first)
    ? (first as Locale)
    : DEFAULT_LOCALE;
  const c = notFoundCopy[locale];

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      {/* Next discards a page's metadata once notFound() is thrown and falls
          back to the layout's title, so this 404 was inheriting the HOME page's
          title — tab, history entry, bookmark and share card all claiming to be
          the front door. A <title> element rendered here is hoisted into <head>
          by React and overrides it. */}
      <title>{c.metaTitle}</title>
      <p className="text-xs uppercase tracking-eyebrow text-pine">{c.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-balance sm:text-4xl">{c.title}</h1>
      <p className="mt-5 text-lg text-ink-soft">{c.body}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`/${locale}`}
          className="inline-flex min-h-11 items-center rounded-lg border border-pine px-5 py-3 text-sm font-medium text-pine"
        >
          {c.homeCta}
        </a>
        <a
          href={`/${locale}/mri?utm_source=not_found&utm_medium=recovery`}
          className="inline-flex min-h-11 items-center rounded-lg bg-pine px-5 py-3 text-sm font-semibold text-paper"
        >
          {c.mriCta}
        </a>
      </div>

      <p className="mt-6 text-sm text-ink-soft">{c.indexHint}</p>
    </main>
  );
}
