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
 * Its three entries are decision moments, not product categories, because that
 * is the only thing a first-time reader can match themselves against. Landing
 * on /salary-report from search used to be a dead end: the old per-page nav
 * held the site name and a language switcher and nothing else.
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

        <nav aria-label={n.footerTitle} className="hidden items-center gap-6 md:flex">
          {n.doors.map((d) => (
            <a
              key={d.href}
              href={`${base}${d.href}`}
              onClick={() => go(d.href, 'header')}
              className="group text-sm text-ink-soft transition-colors hover:text-pine"
            >
              <span className="block leading-tight">{d.label}</span>
              <span className="block text-xs text-ink-soft/70 group-hover:text-pine/70">{d.hint}</span>
            </a>
          ))}
          <a
            href={`${base}${n.practice.href}`}
            onClick={() => go(n.practice.href, 'header')}
            className="shrink-0 text-sm text-ink-soft transition-colors hover:text-pine"
          >
            {n.practice.label}
          </a>
          <a
            href={`${base}/services`}
            onClick={() => go('/services', 'header')}
            className="shrink-0 rounded-lg border border-pine px-4 py-2 text-sm text-pine"
          >
            {n.services}
          </a>
          <ReturnReportLink locale={locale} label={returnReportLabel} />
          <LanguageSwitcher current={locale} />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ReturnReportLink locale={locale} label={returnReportLabel} />
          <LanguageSwitcher current={locale} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav-mobile"
            className="rounded-lg border border-line px-3 py-1.5 text-sm"
          >
            {open ? '×' : '≡'}
          </button>
        </div>
      </div>

      {open && (
        <nav id="site-nav-mobile" aria-label={n.footerTitle} className="border-t border-line md:hidden">
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
            <li className="border-b border-line/60">
              <a
                href={`${base}${n.practice.href}`}
                onClick={() => go(n.practice.href, 'header_mobile')}
                className="block py-3 text-sm"
              >
                {n.practice.label}
              </a>
            </li>
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
