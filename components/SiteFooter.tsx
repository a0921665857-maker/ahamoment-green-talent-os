'use client';
import { useState } from 'react';
import { LINE_OA_URL, type Locale } from '@/lib/constants';
import { LINE_OA_ID, navCopy } from '@/content/nav';
import { landing as landingEn } from '@/content/en/landing';
import { landing as landingZhTW } from '@/content/zh-TW/landing';
import { phCapture } from '@/components/PostHogProvider';

/**
 * The strongest trust sentence on the site used to live only in the home page's
 * own footer, which meant the one page that actually asks for your CV — /mri —
 * never showed it. Read straight off `landing.footer.deleteLine` rather than
 * copied, so the promise cannot drift between the two places it appears.
 */
const deleteLine: Record<Locale, string> = {
  en: landingEn.footer.deleteLine,
  'zh-TW': landingZhTW.footer.deleteLine,
};

/**
 * Rights/attribution line. It used to live only in the home page's own footer;
 * when that page-local footer was removed the site lost its byline entirely on
 * every page. Read off `landing.footer.rightsLine` for the same reason as
 * `deleteLine` above — one source, no copied strings to drift.
 */
const rightsLine: Record<Locale, string> = {
  en: landingEn.footer.rightsLine,
  'zh-TW': landingZhTW.footer.rightsLine,
};

/**
 * Footer sitemap — the second half of the fix for a site with no road network.
 * Every public route is reachable from every page, so arriving on a deep page
 * from search is no longer a dead end.
 *
 * The desktop LINE block exists because the add-friend deep link does nothing
 * on a laptop, and the constitution routes every sale through LINE. Showing a
 * copyable Official Account id is the honest desktop equivalent; a QR image can
 * be dropped in later via NEXT_PUBLIC_LINE_QR_PATH without touching this file.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const n = navCopy[locale];
  const base = `/${locale}`;
  const [copied, setCopied] = useState(false);
  const qr = process.env.NEXT_PUBLIC_LINE_QR_PATH?.trim();

  async function copyId() {
    try {
      await navigator.clipboard.writeText(LINE_OA_ID);
      setCopied(true);
      phCapture('cta_clicked', { cta: 'line_id_copied', surface: 'footer', locale });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the id is selectable text anyway */
    }
  }

  return (
    <footer className="mt-24 border-t border-line bg-mist/20">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-xs uppercase tracking-eyebrow text-ink-soft">{n.footerTitle}</h2>

        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {n.footerGroups.map((g) => (
            <div key={g.title}>
              <h3 className="text-sm font-semibold">{g.title}</h3>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={`${base}${l.href}`}
                      onClick={() => phCapture('nav_clicked', { href: l.href, where: 'footer', locale })}
                      className="text-sm text-ink-soft underline-offset-2 hover:text-pine hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-8">
          <h3 className="text-sm font-semibold">{n.contactTitle}</h3>
          <div className="mt-3 flex flex-wrap items-start gap-x-8 gap-y-4">
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => phCapture('line_add_clicked', { context: 'footer' })}
              className="rounded-lg border border-pine px-4 py-2 text-sm text-pine"
            >
              {n.contactLine}
            </a>
            <a
              href={`mailto:${n.contactEmail}`}
              onClick={() => phCapture('cta_clicked', { cta: 'email', surface: 'footer', locale })}
              className="py-2 text-sm text-ink-soft underline-offset-2 hover:text-pine hover:underline"
            >
              {n.contactEmail}
            </a>
          </div>

          {/* Desktop path: the deep link above is inert on a laptop. */}
          <div className="mt-6 rounded-xl border border-line bg-paper px-5 py-4">
            <p className="text-sm font-medium">{n.lineDesktopTitle}</p>
            <p className="mt-1 max-w-[35rem] text-sm text-ink-soft">{n.lineDesktopBody}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-eyebrow text-ink-soft">{n.lineIdLabel}</span>
              <code className="rounded-lg bg-mist px-2 py-1 text-sm font-medium text-ink">{LINE_OA_ID}</code>
              <button
                type="button"
                onClick={copyId}
                className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-pine hover:text-pine"
              >
                {copied ? n.lineCopied : n.lineCopy}
              </button>
            </div>
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt={`${n.lineIdLabel} QR`}
                width={144}
                height={144}
                className="mt-4 h-36 w-36 rounded-lg border border-line bg-paper"
              />
            )}
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">{deleteLine[locale]}</p>
        <p className="mt-3 text-sm text-ink-soft">{rightsLine[locale]}</p>
      </div>
    </footer>
  );
}
