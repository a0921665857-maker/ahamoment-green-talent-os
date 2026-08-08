'use client';

import { useEffect, useState } from 'react';
import { LINE_OA_URL } from '@/lib/constants';
import { phCapture } from '@/components/PostHogProvider';

/**
 * Mobile-only sticky action bar (brutal review 2026-07-18: the report is ~15
 * screens but the only conversion CTA sat on screen 12, with no floating CTA —
 * readers moved to act mid-report and found nothing to tap). Fades in after the
 * reader scrolls past the first screen. `sm:hidden` so desktop is untouched.
 *
 * Two surfaces now mount it, and they are a union rather than a pile of
 * optional props so the wrong combination cannot be typed:
 *
 *  · report  — the original. Primary is an external booking URL opened in a new
 *    tab, secondary is LINE, and both are dual-sinked into /api/mri/event
 *    because a report has a session token to attach them to.
 *  · landing — the home page is 12 screens with its next diagnostic entry 6,389px
 *    below the first one (UX audit 2026-08-08); on a phone this bar is what
 *    closes that gap. One button, on-site, same tab. Deliberately NOT
 *    dual-sinked: there is no session token on the home page, so every row would
 *    be an unattributed write into a table scoped to an MRI run.
 */
export type MobileStickyCtaProps =
  | {
      surface?: 'report';
      bookUrl: string;
      callLabel: string;
      lineLabel: string;
      sessionToken?: string | null;
    }
  | {
      surface: 'landing';
      /** On-site href (the MRI), already carrying its utm parameters. */
      href: string;
      ctaLabel: string;
    };

export function MobileStickyCta(props: MobileStickyCtaProps) {
  const [shown, setShown] = useState(false);
  const landing = props.surface === 'landing';

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function track(name: 'booking_clicked' | 'line_add_clicked' | 'cta_clicked', extra: Record<string, string>) {
    phCapture(name, { ...extra, placement: 'sticky_mobile' });
    if (landing) return; // no session token to attach — see the note above
    const sessionToken = 'sessionToken' in props ? (props.sessionToken ?? null) : null;
    try {
      void fetch('/api/mri/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          session_token: sessionToken,
          props: { ...extra, placement: 'sticky_mobile' },
        }),
        keepalive: true,
      });
    } catch {
      /* best-effort */
    }
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        shown ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3">
        {landing ? (
          <a
            href={props.href}
            onClick={() => track('cta_clicked', { cta: 'mri', surface: 'landing' })}
            className="flex-1 rounded-lg bg-pine px-4 py-3 text-center text-sm font-medium text-paper"
          >
            {props.ctaLabel}
          </a>
        ) : (
          <>
            <a
              href={props.bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('booking_clicked', { offer: 'intro_call_free' })}
              className="flex-1 rounded-lg bg-pine px-4 py-3 text-center text-sm font-medium text-paper"
            >
              {props.callLabel}
            </a>
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('line_add_clicked', { context: 'sticky_mobile' })}
              className="shrink-0 rounded-lg border border-pine px-4 py-3 text-center text-sm font-medium text-pine"
            >
              {props.lineLabel}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
