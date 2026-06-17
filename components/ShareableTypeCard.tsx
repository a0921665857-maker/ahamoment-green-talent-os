'use client';
import { useState } from 'react';
import type { ResultCategory } from '@/lib/constants';
import type { ShareContent } from '@/content/schema';

/** Face-giving, shareable career-type card with a soft "test yourself" CTA. */
export function ShareableTypeCard(props: {
  category: ResultCategory;
  content: ShareContent;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const type = props.content.types[props.category];
  const text = `${type.shareLine} ${props.shareUrl}`.trim();

  async function onShare() {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled or clipboard blocked — no-op */
    }
  }

  return (
    <section className="mt-16 rounded-xl border-2 border-pine bg-paper p-6 text-center">
      <p className="text-xs uppercase tracking-eyebrow text-pine">{props.content.heading}</p>
      <p className="mt-2 text-2xl font-semibold">{type.label}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onShare}
          className="rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
        >
          {copied ? props.content.copied : props.content.shareButton}
        </button>
        <a
          href={props.shareUrl}
          className="rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
        >
          {props.content.softCta}
        </a>
      </div>
    </section>
  );
}
