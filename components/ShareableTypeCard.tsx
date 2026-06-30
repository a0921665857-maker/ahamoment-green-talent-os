'use client';
import { useEffect, useState } from 'react';
import type { Locale, ResultCategory } from '@/lib/constants';
import type { ShareContent } from '@/content/schema';
import { phCapture } from '@/components/PostHogProvider';

/**
 * Per-type "cast" system. Each archetype gets a deep accent (hero text + top edge),
 * a soft tile tint (behind the motif), and one emoji motif — so the 8 cards read as
 * a family. Palette is earthy/green-anchored on purpose (no candy colours); types
 * 1–4 sit in the green/teal "in the track" cluster, 5–8 drift to warm bronze/clay/
 * amber/slate ("potential not yet realised"), so colour temperature mirrors the arc.
 */
const TYPE_STYLE: Record<ResultCategory, { accent: string; tint: string; emoji: string }> = {
  ready_for_mba_story_sprint: { accent: '#1e4d3b', tint: '#dde8e0', emoji: '🚀' },
  strong_profile_weak_story: { accent: '#2b5f6b', tint: '#d9e6e8', emoji: '💎' },
  climate_career_builder: { accent: '#3d6b3f', tint: '#dde7da', emoji: '🌳' },
  career_positioning_before_mba: { accent: '#5a6b3a', tint: '#e4e8d6', emoji: '🧭' },
  profile_building_needed: { accent: '#7a6a3f', tint: '#ece5d3', emoji: '⛏️' },
  high_potential_low_commercial_clarity: { accent: '#8a5a3c', tint: '#efe2d6', emoji: '🏷️' },
  interview_ready_positioning_weak: { accent: '#8a6d28', tint: '#f0e8cf', emoji: '⚡' },
  cv_strong_narrative_weak: { accent: '#46566b', tint: '#dfe3ea', emoji: '📄' },
};

/** Ready-to-post copy (Threads/LinkedIn) — turns the result into a shareable post, not just a link. */
const POST_TEMPLATE: Record<Locale, (label: string, line: string, url: string) => string> = {
  'zh-TW': (label, line, url) =>
    `我用「綠領職涯 MRI」測了自己的定位，結果是：${label}\n\n${line}\n\n如果你也在往氣候 / 永續 / 綠領轉，值得花 5 分鐘看看你現在被市場讀成哪一種人 👇\n${url}`,
  en: (label, line, url) =>
    `I ran my positioning through the Green Career MRI. Result: ${label}\n\n${line}\n\nIf you're moving into climate / sustainability, it's worth 5 minutes to see how the market actually reads you 👇\n${url}`,
};

export function ShareableTypeCard(props: {
  locale: Locale;
  category: ResultCategory;
  content: ShareContent;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const type = props.content.types[props.category];
  const style = TYPE_STYLE[props.category];
  // The shareLine is "…類型是「LABEL」——<quotable>"; the label is already the hero,
  // so the card + post show only the quotable half after the em-dash.
  const cardLine = (type.shareLine.split(/——|—/)[1] ?? type.shareLine).trim();
  const text = POST_TEMPLATE[props.locale](type.label, cardLine, props.shareUrl).trim();
  const viewerHook = props.locale === 'zh-TW' ? '你是哪一型？來測 →' : 'Which type are you? →';
  const bandLabels = props.locale === 'zh-TW' ? '潛力 · 成形 · 到位' : 'Emerging · Developing · Strong';

  // Reaching this card means the report fully rendered — completes the funnel in PostHog.
  useEffect(() => {
    phCapture('report_viewed', { category: props.category });
  }, [props.category]);

  async function onShare() {
    phCapture('cta_clicked', { cta: 'share_result' });
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
    <section className="mt-16">
      {/* Screenshot-worthy, MBTI-style type card */}
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
        {/* accent edge — the thumbnail-recognisable signature */}
        <div style={{ height: 10, background: style.accent }} />
        <div className="px-7 py-9 text-center">
          <p className="text-xs uppercase tracking-eyebrow text-pine">{props.content.heading}</p>

          {/* motif tile */}
          <div
            className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: style.tint }}
          >
            <span style={{ fontSize: 44, lineHeight: 1 }}>{style.emoji}</span>
          </div>

          {/* type name — the hero */}
          <h3 className="mt-5 text-2xl font-bold leading-tight" style={{ color: style.accent }}>
            {type.label}
          </h3>

          {/* the quotable, anti-雞湯 one-liner */}
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{cardLine}</p>

          {/* band-scale glyph — the brand constant, identical on every card */}
          <div className="mt-7 flex items-end justify-center gap-1.5" aria-hidden>
            <span className="h-4 w-7 rounded-sm bg-band-emerging" />
            <span className="h-6 w-7 rounded-sm bg-band-developing" />
            <span className="h-9 w-7 rounded-sm bg-band-strong" />
          </div>
          <p className="mt-2 text-[11px] tracking-wide text-ink-soft">{bandLabels}</p>

          <div className="mx-auto mt-7 h-px w-full bg-line" />

          {/* viewer-curiosity hook + brand lockup */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold" style={{ color: style.accent }}>
              {viewerHook}
            </span>
            <span className="flex flex-col text-right text-[10px] uppercase leading-tight tracking-eyebrow text-pine/70">
              <span className="font-semibold text-pine">AhaMoment</span>
              <span>Green Career MRI</span>
            </span>
          </div>
        </div>
      </div>

      {/* actions (not part of the screenshot) */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
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
      <p className="mt-3 text-center text-xs text-ink-soft">{props.content.screenshotHint}</p>
    </section>
  );
}
