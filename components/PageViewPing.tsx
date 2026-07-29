'use client';
import { useEffect, useRef } from 'react';
import { phCapture } from '@/components/PostHogProvider';

/**
 * Fires one named page-level event per mount, for pages that had no
 * instrumentation at all (services, judgment, the level table). Deliberately
 * separate from `$pageview`: this is the page's own product event, so a rename
 * or a route change does not silently break a funnel.
 *
 * Guarded against React StrictMode's double-invoke in dev so the count is a
 * count of people, not of renders — the exact defect that made `mri_started`
 * unusable as a funnel denominator.
 */
export function PageViewPing({
  name,
  props,
}: {
  name: string;
  props?: Record<string, string | number | boolean>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    phCapture(name, props ?? {});
  }, [name, props]);
  return null;
}
