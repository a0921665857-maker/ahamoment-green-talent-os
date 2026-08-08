import type { Metadata } from 'next';
import { LOCALES } from '@/lib/constants';
import { notFoundCopy } from '@/content/notFound';
import '@/app/globals.css';

export const metadata: Metadata = { title: '404' };

/**
 * The root 404 — the one Next reaches for when a URL matches nothing anywhere,
 * i.e. outside the locale route group: a path with a dot in it (proxy.ts lets
 * those through untouched), an unknown /admin path, anything that never gets a
 * locale prefix at all.
 *
 * It owns its own <html>/<body> because this app has no root layout: both route
 * groups declare their own. lang="en" with the Chinese half explicitly marked
 * lang="zh-Hant-TW" is the honest markup here — there is no locale to read, so
 * the page shows both languages rather than guessing and getting it wrong.
 * Every locale-prefixed 404 lands on the locale-scoped page instead, which is
 * single-language and carries the header and the footer sitemap.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <main className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-xs uppercase tracking-eyebrow text-pine">404</p>

          {LOCALES.map((locale) => {
            const c = notFoundCopy[locale];
            return (
              <section
                key={locale}
                lang={locale === 'zh-TW' ? 'zh-Hant-TW' : 'en'}
                className="mt-8 border-t border-line pt-8 first-of-type:border-t-0 first-of-type:pt-0"
              >
                <h2 className="text-2xl font-semibold leading-tight">{c.title}</h2>
                <p className="mt-3 text-ink-soft">{c.body}</p>
                <div className="mt-5 flex flex-wrap gap-3">
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
              </section>
            );
          })}
        </main>
      </body>
    </html>
  );
}
