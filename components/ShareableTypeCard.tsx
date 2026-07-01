'use client';
import { useEffect, useState } from 'react';
import type { Locale, ResultCategory } from '@/lib/constants';
import type { ShareContent } from '@/content/schema';
import { phCapture } from '@/components/PostHogProvider';
import { TYPE_STYLE, cardLineOf } from '@/lib/shareCardStyle';

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
  const cardLine = cardLineOf(type.shareLine);
  const text = POST_TEMPLATE[props.locale](type.label, cardLine, props.shareUrl).trim();
  const imageUrl = `/og/share/${props.category}?locale=${props.locale}`;
  const isZh = props.locale === 'zh-TW';
  const viewerHook = isZh ? '你是哪一型？來測 →' : 'Which type are you? →';
  const bandLabels = isZh ? '潛力 · 成形 · 到位' : 'Emerging · Developing · Strong';
  const imageCta = isZh ? '分享我的圖卡' : 'Share my card';

  // Reaching this card means the report fully rendered — completes the funnel in PostHog.
  useEffect(() => {
    phCapture('report_viewed', { category: props.category });
  }, [props.category]);

  // Native share sheet with the actual image file (mobile); otherwise open the PNG to save.
  async function onShareImage() {
    phCapture('cta_clicked', { cta: 'share_image' });
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], `green-career-mri-${props.category}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text });
          return;
        }
      }
    } catch {
      /* fall through to opening the image in a new tab */
    }
    window.open(imageUrl, '_blank', 'noopener');
  }

  async function onCopyText() {
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
      {/* Screenshot-worthy, MBTI-style type card (mirrors the generated /og/share image) */}
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

      {/* actions — image share is the hero (the viral unit); copy-text is secondary */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onShareImage}
          className="rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
        >
          {imageCta}
        </button>
        <button
          type="button"
          onClick={onCopyText}
          className="rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
        >
          {copied ? props.content.copied : props.content.shareButton}
        </button>
      </div>
      <div className="mt-3 flex flex-col items-center gap-1">
        <a href={props.shareUrl} className="text-sm text-pine underline-offset-2 hover:underline">
          {props.content.softCta} →
        </a>
        <p className="text-xs text-ink-soft">{props.content.screenshotHint}</p>
      </div>
    </section>
  );
}
