'use client';

import { useEffect, useMemo } from 'react';
import type { Locale } from '@/lib/constants';
import { phCapture } from '@/components/PostHogProvider';
import { ScrollDepth } from '@/components/ScrollDepth';

/**
 * The home page's entire measurement rail, mounted once.
 *
 * Until now the landing page was the only high-traffic surface with no
 * instrumentation of its own: no click event on the hero CTA and no reading
 * depth, so "123 people reached /mri" could never be traced back to which part
 * of a 12-screen home page sent them, and any restructuring of that page would
 * have been graded against a blank baseline. This mounts before the
 * restructure, deliberately, so the before and after are measured the same way.
 *
 * Delegation, not a wrapper per link. The home page is a server component and
 * every CTA on it is a plain <a>; wrapping each one in a client component would
 * ship a hydration island per button to make a page that has no interactivity
 * interactive. Instead each link declares itself with a data attribute and one
 * capture-phase listener reads it. Adding a tracked CTA is adding an attribute.
 *
 * No new event names (they would not exist in the 14-day baseline and would not
 * appear in lib/morning-brief.ts). The two the site already uses:
 *   data-cta  → `cta_clicked`  { cta, placement, surface:'landing', href, locale }
 *   data-door → `nav_clicked`  { href, where:'landing_doors', placement, locale }
 * `placement` on a door click carries the same token as that link's utm_content
 * (content/nav.ts), so a click and the pageview it caused reconcile per surface.
 *
 * PostHog only. Unlike the report's CTAs this is NOT dual-sinked into
 * /api/mri/event: there is no session token on the home page, so every row
 * would be an unattributed write, and the first-party events table is scoped to
 * an MRI run.
 */
export function LandingAnalytics({ locale }: { locale: Locale }) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>('[data-cta],[data-door]');
      if (!el) return;

      const href = el.getAttribute('href') ?? '';
      const door = el.dataset.door;
      if (door) {
        // data-href, not the href attribute: the href carries utm parameters and
        // would make the same door read as two different values.
        phCapture('nav_clicked', {
          href: el.dataset.href ?? href,
          where: 'landing_doors',
          placement: door,
          locale,
        });
        return;
      }

      phCapture('cta_clicked', {
        cta: el.dataset.cta ?? 'unknown',
        placement: el.dataset.placement ?? 'landing',
        surface: 'landing',
        href,
        locale,
      });
    }

    // Capture phase: fires even if something downstream stops propagation.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [locale]);

  // Stable identity: ScrollDepth keys its listener on `extra`, and a fresh
  // object literal every render would tear the listener down and rebuild it.
  const extra = useMemo(() => ({ locale }), [locale]);

  return <ScrollDepth surface="landing" extra={extra} />;
}
