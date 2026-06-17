'use client';
import { useState } from 'react';
import type { ResultCategory } from '@/lib/constants';
import type { ShareContent } from '@/content/schema';

/** Per-type accent (on-brand greens) so each badge has a distinct visual identity. */
const ACCENT: Record<ResultCategory, string> = {
  ready_for_mba_story_sprint: '#1e4d3b',
  strong_profile_weak_story: '#3d6b54',
  climate_career_first_mba_later: '#5d8a73',
  career_positioning_before_mba: '#7fa98f',
  profile_building_needed: '#9bb8a5',
  high_potential_low_commercial_clarity: '#2f5a45',
  interview_ready_positioning_weak: '#4a7d63',
  cv_strong_narrative_weak: '#6b9a80',
};

/** Face-giving, screenshot-worthy career-type badge with a soft "test yourself" CTA. */
export function ShareableTypeCard(props: {
  category: ResultCategory;
  content: ShareContent;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const type = props.content.types[props.category];
  const accent = ACCENT[props.category];
  const text = `${type.shareLine} ${props.shareUrl}`.trim();

  async function onShare() {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* user cancelled or clipboard blocked — no-op */
    }
  }

  return (
    <section className="mt-16 overflow-hidden rounded-xl border-2 border-pine bg-paper text-center">
      <div className="h-2 w-full" style={{ background: accent }} />
      <div className="px-6 py-9">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{props.content.heading}</p>

        <div className="mt-5 flex items-end justify-center gap-1.5" aria-hidden>
          <span className="h-4 w-7 rounded-sm bg-band-emerging" />
          <span className="h-6 w-7 rounded-sm bg-band-developing" />
          <span className="h-9 w-7 rounded-sm bg-band-strong" />
        </div>

        <p className="mt-5 text-3xl font-semibold leading-tight" style={{ color: accent }}>
          {type.label}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">{type.shareLine}</p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
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

        <p className="mt-5 text-xs text-ink-soft">{props.content.screenshotHint}</p>
        <p className="mt-3 text-xs uppercase tracking-eyebrow text-pine/70">AhaMoment · Green Career MRI</p>
      </div>
    </section>
  );
}
