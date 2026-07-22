/**
 * Attaches report context to a booking URL so a booking is no longer anonymous.
 * Calendly echoes utm params into its confirmation email and webhook, letting
 * Michael open the exact report before the call (unknown-unknown scan 2026-07-18:
 * the token evaporated at every human handoff, so he walked into calls blind).
 *
 * Host-aware since the Cal.com dual-run (2026-07-22): Cal.com forwards
 * `metadata[...]` query params into its webhook payload, which is where
 * lib/calcomWebhook.ts reads the token back out. utm params are still set on
 * both hosts (harmless on Cal.com, load-bearing on Calendly), so swapping
 * NEXT_PUBLIC_CALENDLY_URL between vendors needs no call-site changes.
 * Cal.com metadata passthrough is a dual-run verification gate, not assumed:
 * one real booking must show report_token in PostHog before Calendly retires.
 */
export function calendlyWithContext(
  baseUrl: string,
  ctx: { token?: string | null; category?: string; offer?: string },
): string {
  if (!baseUrl) return '#';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'mri_report');
    url.searchParams.set('utm_medium', 'booking');
    if (ctx.token) url.searchParams.set('utm_content', ctx.token);
    if (ctx.category) url.searchParams.set('utm_campaign', ctx.category);
    if (ctx.offer) url.searchParams.set('utm_term', ctx.offer);
    if (/(^|\.)cal\.com$/.test(url.hostname)) {
      if (ctx.token) url.searchParams.set('metadata[token]', ctx.token);
      if (ctx.category) url.searchParams.set('metadata[category]', ctx.category);
      if (ctx.offer) url.searchParams.set('metadata[offer]', ctx.offer);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}
