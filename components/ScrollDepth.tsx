'use client';
import { useEffect, useRef } from 'react';
import { phCapture } from '@/components/PostHogProvider';

const MARKS = [25, 50, 75, 90] as const;

/**
 * Reading-depth beacons for long pages.
 *
 * The report is roughly fifteen screens and converts at 4.8%. Nobody can say
 * whether that is a weak call-to-action or a page nobody reaches the end of,
 * because the only signal we had was "the page was opened". Each threshold
 * fires at most once per mount; `device` is bucketed by viewport width so the
 * desktop-versus-mobile split can be read without a session recording.
 */
export function ScrollDepth({
  surface,
  extra,
}: {
  surface: string;
  extra?: Record<string, string | number | boolean>;
}) {
  const sent = useRef<Set<number>>(new Set());

  useEffect(() => {
    const device = window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = ((window.scrollY || doc.scrollTop) / scrollable) * 100;
      for (const m of MARKS) {
        if (pct >= m && !sent.current.has(m)) {
          sent.current.add(m);
          phCapture('scroll_depth', { surface, depth: m, device, ...(extra ?? {}) });
        }
      }
    }

    onScroll(); // a short viewport can already be at 90% on load
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [surface, extra]);

  return null;
}
