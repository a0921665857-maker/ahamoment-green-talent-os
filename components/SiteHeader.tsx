'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/constants';
import { navCopy } from '@/content/nav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ReturnReportLink } from '@/components/ReturnReportLink';
import { phCapture } from '@/components/PostHogProvider';

/**
 * The one header every page shares.
 *
 * Its entries are the reader's own situation, not product categories, because
 * that is the only thing a first-time reader can match themselves against. They
 * are also in order, and the order is one journey: I don't know what I'm missing
 * → I know, and I want to close it → I'm looking at roles → I have an offer to
 * compare. The second stage was missing for a while, which meant the site named
 * a reader's gap and then handed them job listings with nothing in between.
 *
 * Landing on /salary-report from search used to be a dead end: the old per-page
 * nav held the site name and a language switcher and nothing else.
 *
 * Client component only for the mobile disclosure and the click events; it
 * renders its full link list in the initial HTML, so a crawler and a reader
 * with JS still loading both see every route.
 */
export function SiteHeader({
  locale,
  siteName,
  returnReportLabel,
}: {
  locale: Locale;
  siteName: string;
  /** Return visitors: renders only when a report token is in localStorage. */
  returnReportLabel: string;
}) {
  const n = navCopy[locale];
  const [open, setOpen] = useState(false);
  const base = `/${locale}`;

  function go(href: string, where: 'header' | 'header_mobile') {
    phCapture('nav_clicked', { href, where, locale });
  }

  return (
    <header className="border-b border-line">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-pine focus:px-4 focus:py-2 focus:text-paper"
      >
        {n.skipToContent}
      </a>

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <a href={base} className="text-sm font-semibold tracking-tight" onClick={() => go(base, 'header')}>
          {siteName}
        </a>

        {/* One rail, not two. The report link, the language switcher and the menu
            button are mounted once and shared by both layouts. They used to be
            written twice — once inside the desktop nav, once beside the mobile
            toggle — which put two live LanguageSwitcher instances in every page's
            DOM with one hidden by CSS, and shipped a duplicate set of nav controls
            to assistive tech.

            This row is the single wrap context, and that is load-bearing. The rail
            is 812px wide from 1024px up (max-w-5xl caps it); the zh-TW doors plus
            服務與定價 need 757px and the language switcher another 113px, so one of
            them has to fall to a second line. The only acceptable one is the
            switcher. Deduplicating the switcher by lifting it OUT of the nav and
            into its own flex row made the nav a 679px box instead: the doors
            filled it and 服務與定價 — the site's only paid-service entry — got
            pushed alone onto row two, growing the zh-TW header 99px → 113px at
            every desktop width. Keeping every wrappable item in one wrap context
            restores the old line-breaking with only one switcher in the DOM.

            Wrapping is lg-only. Below lg the row holds just the switcher and the
            menu toggle, and at 375px they are ~6px wider than the space left over
            from the site name — with wrap on, the switcher dropped to a second
            line and the mobile header grew 77px → 105px. nowrap lets the site
            name give up the pixels instead, which is what it did before. */}
        <div className="flex min-w-0 flex-nowrap items-center justify-end gap-x-3 gap-y-2 lg:flex-wrap lg:gap-x-5">
          {/* Four doors plus the services button no longer fit between the site
              name and the language switcher at 768px, so the full rail waits for
              lg and the disclosure below covers md. Cramming them was the other
              option and it produced two-line labels in a 44px-tall header.

              display:contents at lg (not flex) so the doors are flex items of the
              row above rather than of a nested box — that is what puts them in the
              same wrap context as the switcher. The element stays a real <nav>,
              and the landmark survives the box being removed — verified in
              Chrome's accessibility tree, which still reports
              navigation "站內索引" with all six links under it. Browsers used to
              drop implicit roles for display:contents; that was fixed years ago,
              but if a target browser ever regressed it the failure mode is a lost
              landmark, not a lost link. */}
          <nav aria-label={n.footerTitle} className="hidden lg:contents">
            {n.doors.map((d) => (
              <a
                key={d.href}
                href={`${base}${d.href}`}
                onClick={() => go(d.href, 'header')}
                className="group whitespace-nowrap text-sm text-ink-soft transition-colors hover:text-pine"
              >
                <span className="block leading-tight">{d.label}</span>
                {/* full-strength ink-soft: the /70 flattened to 3.50:1 on paper, and
                    this is the persistent header, so it failed AA on every page. */}
                <span className="block text-xs text-ink-soft group-hover:text-pine">{d.hint}</span>
              </a>
            ))}
            <a
              href={`${base}/services`}
              onClick={() => go('/services', 'header')}
              className="shrink-0 rounded-lg border border-pine px-4 py-2 text-sm text-pine"
            >
              {n.services}
            </a>
          </nav>

          <ReturnReportLink locale={locale} label={returnReportLabel} />
          <LanguageSwitcher current={locale} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav-mobile"
            aria-label={open ? n.menuClose : n.menuOpen}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line px-3 py-1.5 text-sm lg:hidden"
          >
            {/* the glyph was the button's whole accessible name: a screen reader
                announced "identical to" for the site's only mobile nav control. */}
            <span aria-hidden="true">{open ? '×' : '≡'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="site-nav-mobile" aria-label={n.footerTitle} className="border-t border-line lg:hidden">
          <ul className="mx-auto max-w-5xl px-6 py-3">
            {n.doors.map((d) => (
              <li key={d.href} className="border-b border-line/60 last:border-0">
                <a
                  href={`${base}${d.href}`}
                  onClick={() => go(d.href, 'header_mobile')}
                  className="block py-3 text-sm"
                >
                  <span className="block font-medium">{d.label}</span>
                  <span className="block text-xs text-ink-soft">{d.hint}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={`${base}/services`}
                onClick={() => go('/services', 'header_mobile')}
                className="block py-3 text-sm font-medium text-pine"
              >
                {n.services}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
