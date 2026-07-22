/**
 * This project's PostHog lives in the EU cloud (project 211005), so the
 * ingestion host is a fact, not configuration. It historically came only from
 * NEXT_PUBLIC_POSTHOG_HOST, and a wrong value there (legacy app.posthog.com)
 * caused a total silent event loss: US ingestion answers 200, then drops
 * unknown EU keys asynchronously (incident 2026-07-22 — bookings, funnels and
 * report_generated all vanished with every layer reporting success).
 * Normalizing here makes a bad or missing env value harmless.
 */
const EU_INGEST = 'https://eu.i.posthog.com';

export function posthogHost(raw?: string | null): string {
  const v = (raw ?? '').trim().replace(/\/+$/, '');
  if (!v) return EU_INGEST;
  // Legacy/US hosts silently drop EU-keyed events; EU app host is not the ingest host.
  if (/^https:\/\/(app|us|us\.i|eu)\.posthog\.com$/.test(v)) return EU_INGEST;
  return v;
}
