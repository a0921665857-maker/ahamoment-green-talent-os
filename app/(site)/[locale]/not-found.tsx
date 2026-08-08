'use client';

import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/constants';
import { notFoundCopy } from '@/content/notFound';

/**
 * The locale-scoped 404. Renders inside app/(site)/[locale]/layout.tsx, so it
 * inherits the correct <html lang>, the header and the footer sitemap — which
 * is the whole point: a 404 here is a fork in the road, not a dead end.
 *
 * Reached via app/(site)/[locale]/[...unmatched]/page.tsx, which is what turns
 * an unmatched URL into a notFound() inside this segment. Without that
 * catch-all, Next resolves unmatched URLs against the ROOT not-found only and
 * this file would never render.
 *
 * Client component because not-found.tsx receives no params: the locale has to
 * come from the path. Reading it here rather than from a header keeps the fix
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
