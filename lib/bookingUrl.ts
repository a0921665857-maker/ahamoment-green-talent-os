/**
 * Attaches report context to a Calendly URL so a booking is no longer anonymous.
 * Calendly echoes utm params into its confirmation email and webhook, letting
 * Michael open the exact report before the call (unknown-unknown scan 2026-07-18:
 * the token evaporated at every human handoff, so he walked into calls blind).
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
    return url.toString();
  } catch {
    return baseUrl;
  }
}
