'use client';
import type { Locale } from '@/lib/constants';
import { LINE_OA_URL } from '@/lib/constants';
import type { PaidOffersContent } from '@/content/schema';
import { phCapture } from '@/components/PostHogProvider';
import { calendlyWithContext } from '@/lib/bookingUrl';

/**
 * Compact CTA rendered inside the report body (after the second section).
 * Placement experiment: 30 days of data showed 0 booking clicks and only 2
 * reply-email users on the bottom-of-page CTA, so this tests "earlier + lighter".
 * Events carry placement:'inline' so the two positions stay comparable.
 */
export function InlineCtaCard(props: {
  locale: Locale;
  content: PaidOffersContent;
  calendlyUrl: string;
  /** null on the public sample page — events are still recorded, just unattributed. */
  sessionToken: string | null;
  /** Result type label + category — carried into the booking/reply so the handoff
   * to a real conversation is no longer anonymous. Optional on the sample page. */
  categoryLabel?: string;
  category?: string;
}) {
  const t = props.content.inlineCta;
  const isZh = props.locale === 'zh-TW';
  const label = props.categoryLabel;
  const replySubject = isZh ? '我的 MRI 想問一個問題' : 'One question about my MRI';
  const replyBody = isZh
    ? `Michael 你好，我的類型是「${label ?? '______'}」，我想問的一個問題是：`
    : `Hi Michael — my type is "${label ?? '______'}", and my one question is:`;
  const mailto = `mailto:${props.content.replyEmail}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
  const bookUrl = calendlyWithContext(props.calendlyUrl, { token: props.sessionToken, category: props.category });

  function track(name: 'booking_clicked' | 'cta_clicked', extra: Record<string, string>) {
    // Dual-sinked on purpose — see PostHogProvider note. PostHog funnels must
    // see the last mile; the first-party events table stays canonical.
    phCapture(name, { ...extra, placement: 'inline' });
    try {
      void fetch('/api/mri/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          session_token: props.sessionToken,
          props: { ...extra, placement: 'inline' },
        }),
        keepalive: true,
      });
    } catch {
      /* best-effort */
    }
  }

  return (
    <aside className="my-2 rounded-xl border border-line bg-sage-soft/20 px-5 py-4">
      <p className="text-sm text-ink">{t.line}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={mailto}
          onClick={() => track('cta_clicked', { cta: 'reply_email' })}
          className="text-sm font-medium text-pine underline-offset-2 hover:underline"
        >
          {t.replyCta} →
        </a>
        <a
          href={bookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('booking_clicked', { offer: 'intro_call_free' })}
          className="text-sm font-medium text-pine underline-offset-2 hover:underline"
        >
          {t.bookCta} →
        </a>
        <a
          href={LINE_OA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => phCapture('line_add_clicked', { context: 'report_mid' })}
          className="text-sm font-medium text-pine underline-offset-2 hover:underline"
        >
          {t.lineCta} →
        </a>
      </div>
    </aside>
  );
}
