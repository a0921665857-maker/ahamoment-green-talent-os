/**
 * Server-side PostHog capture (fetch-based, no extra dependency).
 *
 * Why this exists: report_generated fires inside the answers route's after()
 * block, after the HTTP response is sent, so it can never go through the
 * client posthog-js SDK. Before this, that step was invisible in PostHog
 * funnels (CPO audit 2026-07). We forward the client's distinct_id so the
 * server event joins the same person's funnel; when it is unavailable we fall
 * back to the session token (still countable as a health metric, just not
 * funnel-joined). No-op when NEXT_PUBLIC_POSTHOG_KEY is unset.
 */
import { posthogHost } from './posthogHost';

export async function phCaptureServer(
  event: string,
  distinctId: string,
  props: Record<string, string | number | boolean> = {},
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const host = posthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST);
  try {
    await fetch(`${host}/i/v0/e/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties: { ...props, $lib: 'posthog-server-fetch' },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    /* analytics best-effort — never break the pipeline */
  }
}
