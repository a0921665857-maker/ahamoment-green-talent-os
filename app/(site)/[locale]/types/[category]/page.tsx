import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { RESULT_CATEGORIES, type Locale, type ResultCategory } from '@/lib/constants';
import { TYPE_STYLE, cardLineOf } from '@/lib/shareCardStyle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function isCategory(x: string): x is ResultCategory {
  return (RESULT_CATEGORIES as readonly string[]).includes(x);
}

export function generateStaticParams() {
  return RESULT_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale) || !isCategory(category)) return {};
  const L = locale as Locale;
  const c = getContent(L);
  const type = c.share.types[category];
  const line = cardLineOf(type.shareLine);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const image = `${base}/og/share/${category}?locale=${L}`;
  const title = `${type.label}｜${c.seo.siteName}`;
  return {
    title,
    description: line,
    openGraph: {
      title,
      description: line,
      images: [{ url: image, width: 1080, height: 1080 }],
    },
    twitter: { card: 'summary_large_image', title, description: line, images: [image] },
  };
}

/**
 * Public per-type page — the landing a shared result link points to, so the link
 * unfurls as that type's card (OG image above) and gives the visitor a real place
 * to land and then take the MRI. Renders a STATIC card (no report_viewed event —
 * that must only fire on a real report, not this landing).
 */
export default async function TypePage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isLocale(locale) || !isCategory(category)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const isZh = L === 'zh-TW';
  const type = c.share.types[category];
  const style = TYPE_STYLE[category];
  const line = cardLineOf(type.shareLine);

  const t = {
    means: isZh
      ? '這是「市場現在怎麼讀你」的其中一種樣子——不是對你這個人的最終評價。同一個人，把定位講清楚，就可能往右移一格。'
      : "This is one way the market reads you right now — not a verdict on who you are. The same person can move up a band once the positioning is clear.",
    bandNote: isZh
      ? '潛力 → 成形 → 到位：三格說的是「被讀懂的程度」，不是能力高低。'
      : 'Emerging → Developing → Strong describes how clearly you’re read — not how capable you are.',
    cta: isZh ? '免費測我的完整定位' : 'Get my full positioning — free',
    all: isZh ? '看全部 8 種類型' : 'Browse all 8 types',
    bandLabels: isZh ? '潛力 · 成形 · 到位' : 'Emerging · Developing · Strong',
  };

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        {/* the type card (static mirror of the shareable card / OG image) */}
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
          <div style={{ height: 10, background: style.accent }} />
          <div className="px-7 py-9 text-center">
            <p className="text-xs uppercase tracking-eyebrow text-pine">{c.share.heading}</p>
            <div
              className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: style.tint }}
            >
              <span style={{ fontSize: 44, lineHeight: 1 }}>{style.emoji}</span>
            </div>
            <h1 className="mt-5 text-2xl font-bold leading-tight" style={{ color: style.accent }}>
              {type.label}
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{line}</p>
            <div className="mt-7 flex items-end justify-center gap-1.5" aria-hidden>
              <span className="h-4 w-7 rounded-sm bg-band-emerging" />
              <span className="h-6 w-7 rounded-sm bg-band-developing" />
              <span className="h-9 w-7 rounded-sm bg-band-strong" />
            </div>
            <p className="mt-2 text-[11px] tracking-wide text-ink-soft">{t.bandLabels}</p>
          </div>
        </div>

        {/* honest framing — no fabricated per-type prose */}
        <div className="mx-auto mt-8 max-w-md space-y-3 text-center">
          <p className="text-ink-soft">{t.means}</p>
          <p className="text-sm text-ink-soft">{t.bandNote}</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a href={`/${L}/mri`} className="inline-block rounded-lg bg-pine px-6 py-3 text-paper">
            {t.cta}
          </a>
          <a href={`/${L}/types`} className="text-sm text-pine underline-offset-2 hover:underline">
            {t.all} →
          </a>
        </div>
      </main>
    </div>
  );
}
