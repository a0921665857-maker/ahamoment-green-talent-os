'use client';

import { useEffect, useState } from 'react';
import { LINE_OA_URL } from '@/lib/constants';
import { phCapture } from '@/components/PostHogProvider';

/**
 * Mobile-only sticky action bar for the long report (brutal review 2026-07-18:
 * the report is ~15 screens but the only conversion CTA sat on screen 12, with
 * no floating CTA — readers moved to act mid-report and found nothing to tap).
 * Fades in after the reader scrolls past the first screen. `sm:hidden` so the
 * desktop layout is untouched.
 */
export function MobileStickyCta(props: {
  bookUrl: string;
  callLabel: string;
  lineLabel: string;
  sessionToken?: string | null;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function track(name: 'booking_clicked' | 'line_add_clicked', extra: Record<string, string>) {
    phCapture(name, { ...extra, placement: 'sticky_mobile' });
    try {
      void fetch('/api/mri/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          session_token: props.sessionToken ?? null,
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
      </div>
    </div>
  );
}
