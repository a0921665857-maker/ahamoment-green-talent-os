'use client';
import type { Locale } from '@/lib/constants';
import type { PaidOffersContent } from '@/content/schema';

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
}) {
  const t = props.content.inlineCta;
  const isZh = props.locale === 'zh-TW';
  const replySubject = isZh ? '我的 MRI 想問一個問題' : 'One question about my MRI';
  const replyBody = isZh
    ? 'Michael 你好，我的類型是 ______，我想問的一個問題是：'
    : 'Hi Michael — my type is ______, and my one question is:';
  const mailto = `mailto:${props.content.replyEmail}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;

  function track(name: 'booking_clicked' | 'cta_clicked', extra: Record<string, string>) {
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
          href={props.calendlyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('booking_clicked', { offer: 'intro_call_free' })}
          className="text-sm font-medium text-pine underline-offset-2 hover:underline"
        >
          {t.bookCta} →
        </a>
      </div>
    </aside>
  );
}
