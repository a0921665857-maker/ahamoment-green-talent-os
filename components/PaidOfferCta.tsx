'use client';
import { LINE_OA_URL, type Locale, type OfferId, type ResultCategory } from '@/lib/constants';
import type { PaidOffersContent } from '@/content/schema';
import { FounderAvatar } from '@/components/FounderAvatar';
import { phCapture } from '@/components/PostHogProvider';
import { calendlyWithContext } from '@/lib/bookingUrl';
import {
  isPublicPaidOffer,
  paymentLinkFor,
  paymentLinkWithContext,
  priceFor,
} from '@/lib/services';

interface Slot {
  offer: OfferId;
  role: 'primary' | 'entry';
}

export function PaidOfferCta(props: {
  locale: Locale;
  category: ResultCategory;
  categoryLabel: string;
  slots: Slot[];
  content: PaidOffersContent;
  calendlyUrl: string;
  sessionToken: string;
}) {
  const { content } = props;
  const roleLabel: Record<Slot['role'], string> = {
    primary: content.primaryLabel,
    entry: content.entryLabel,
  };
  const free = content.offers.intro_call_free;
  const isZh = props.locale === 'zh-TW';
  const replySubject = isZh ? '我的 MRI 想問一個問題' : 'One question about my MRI';
  // Prefill the type so the reader is not asked to fill a blank (unknown-unknown
  // scan: the "______" was a dead handoff — most people never filled it).
  const replyBody = isZh
    ? `Michael 你好，我的類型是「${props.categoryLabel}」，我想問的一個問題是：`
    : `Hi Michael — my type is "${props.categoryLabel}", and my one question is:`;
  const mailto = `mailto:${content.replyEmail}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
  // A booking CTA is rendered only when a real booking URL is configured.
  // calendlyWithContext returns '#' for an empty base, and a '#' button that
  // silently does nothing is worse than no button at all.
  const hasBooking = Boolean(props.calendlyUrl?.trim());
  const bookUrl = hasBooking
    ? calendlyWithContext(props.calendlyUrl, { token: props.sessionToken, category: props.category })
    : '';

  function track(
    name: 'booking_clicked' | 'cta_clicked' | 'checkout_started',
    extra: Record<string, string>,
  ) {
    // Deliberately dual-sinked (see PostHogProvider note): the first-party events
    // table is canonical, but PostHog funnels were blind to the last mile — a
    // booking_clicked=0 misread of this exact gap drove a wrong product verdict.
    phCapture(name, { ...extra, category: props.category });
    try {
      void fetch('/api/mri/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, session_token: props.sessionToken, props: { ...extra, category: props.category } }),
        keepalive: true,
      });
    } catch {
      /* best-effort */
    }
  }

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="text-xl font-semibold">{content.title}</h2>
      <p className="mt-2 max-w-2xl text-ink-soft">{content.intro}</p>

      {/* The front door: the free call, as the hero. Lowest-friction, highest-prominence. */}
      <div className="mt-6 rounded-xl border-2 border-pine bg-sage-soft/30 p-6">
        <h3 className="text-lg font-semibold">{free.name}</h3>
        <p className="mt-2 max-w-[35rem] text-sm text-ink">{free.blurb}</p>
        <p className="mt-4 max-w-[35rem] whitespace-pre-line text-sm text-ink-soft">{content.freeAgenda}</p>
        <div className="mt-4 flex items-start gap-3">
          <FounderAvatar className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-line" />
          <p className="max-w-[30rem] text-xs text-ink-soft">
            {content.founderLine}{' '}
            <a
              href="https://www.linkedin.com/in/chao-hsien-wu/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-pine underline-offset-2 hover:underline"
            >
              LinkedIn ↗
            </a>
          </p>
        </div>
        {hasBooking ? (
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('booking_clicked', { offer: 'intro_call_free' })}
            className="mt-5 inline-block rounded-lg bg-pine px-6 py-3 text-sm text-paper"
          >
            {content.freeHeroCta}
          </a>
        ) : (
          <a
            href={LINE_OA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('cta_clicked', { cta: 'line_add', surface: 'report_hero' })}
            className="mt-5 inline-block rounded-lg bg-pine px-6 py-3 text-sm text-paper"
          >
            {content.stickyLine}
          </a>
        )}
        <p className="mt-2 text-xs text-ink-soft">{content.freeReassure}</p>
      </div>

      {/* Even lower friction: reply with one question, no scheduling. */}
      <p className="mt-4 max-w-[35rem] text-sm text-ink-soft">
        {content.replyPrompt}{' '}
        <a
          href={mailto}
          onClick={() => track('cta_clicked', { cta: 'reply_email' })}
          className="font-medium text-pine underline-offset-2 hover:underline"
        >
          {content.replyCta} →
        </a>
      </p>

      {/* Paid options — demoted, opt-in for those already sold. */}
      <p className="mt-10 max-w-[35rem] text-sm text-ink-soft">{content.paidDivider}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {props.slots.map((s) => {
          const o = content.offers[s.offer];
          const isPrimary = s.role === 'primary';
          const paidId = isPublicPaidOffer(s.offer) ? s.offer : null;
          // Price comes from lib/services (single source), never from content —
          // a stale string in a locale file must not be able to disagree with
          // what the payment link actually charges.
          const price = paidId ? priceFor(paidId, props.locale) : null;
          // Carry the session token into Stripe as client_reference_id so every
          // payment maps back to a report (no anonymous money, per the funnel rule).
          const rawLink = paidId ? paymentLinkFor(paidId, props.locale) : null;
          const payHref =
            rawLink && paidId
              ? paymentLinkWithContext(rawLink, {
                  token: props.sessionToken,
                  offer: paidId,
                  locale: props.locale,
                })
              : undefined;
          return (
            <div
              key={s.offer}
              className={
                isPrimary
                  ? 'rounded-xl border-2 border-pine bg-paper p-5'
                  : 'rounded-xl border border-line bg-paper p-5'
              }
            >
              <p className="text-xs uppercase tracking-eyebrow text-pine">{roleLabel[s.role]}</p>
              <h3 className="mt-2 text-lg font-semibold">{o.name}</h3>
              {price && <p className="mt-1 text-sm font-medium text-ink">{price.display}</p>}
              <p className="mt-3 text-sm">{o.blurb}</p>
              <p className="mt-3 text-xs text-ink-soft">{o.delivery}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {bookUrl && (
                  <a
                    href={calendlyWithContext(props.calendlyUrl, {
                      token: props.sessionToken,
                      category: props.category,
                      offer: s.offer,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('booking_clicked', { offer: s.offer })}
                    className={
                      isPrimary
                        ? 'inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper'
                        : 'inline-flex min-h-[44px] items-center rounded-lg border border-pine px-5 py-2.5 text-sm text-pine'
                    }
                  >
                    {content.bookCta}
                  </a>
                )}
                {payHref && (
                  <a
                    href={payHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track('checkout_started', {
                        offer: s.offer,
                        currency: price?.currency ?? 'unknown',
                      })
                    }
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
                  >
                    {content.payCta ?? content.bookCta}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <a
        href={`/${props.locale}/services`}
        className="mt-5 inline-block text-sm text-pine underline-offset-2 hover:underline"
      >
        {content.allServicesCta} →
      </a>

      <p className="mt-6 max-w-[35rem] text-sm text-ink-soft">{content.confidentiality}</p>
    </section>
  );
}
