'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
// Session replay is OFF unless explicitly enabled — this product handles CV/PII
// under an explicit consent flow, so replay needs a deliberate privacy decision.
const REPLAY_ENABLED = process.env.NEXT_PUBLIC_POSTHOG_ENABLE_REPLAY === 'true';

let initialized = false;

function ensureInitialized() {
  if (initialized || typeof window === 'undefined' || !KEY) return;
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // captured manually below for App Router navigations
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    disable_session_recording: !REPLAY_ENABLED,
    session_recording: { maskAllInputs: true }, // never record values typed into fields (CV/email/PII)
  });
  initialized = true;
}

/**
 * PostHog-only funnel capture. Use the canonical names from lib/constants EVENT_NAMES.
 * This is a separate sink from the first-party events table (lib/events.ts) — do NOT
 * route first-party-recorded server events through here too, to avoid double counting.
 * Never pass PII in props (structural data only: input_type, locale, category).
 */
export function phCapture(
  event: string,
  props: Record<string, string | number | boolean> = {},
) {
  if (!initialized) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* analytics best-effort — never break the flow */
  }
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const client = usePostHog();
  useEffect(() => {
    if (!pathname || !client) return;
    let url = window.origin + pathname;
    const query = searchParams?.toString();
    if (query) url += `?${query}`;
    client.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, client]);
  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!KEY) return <>{children}</>; // no-op when unconfigured — app runs normally
  ensureInitialized();
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
