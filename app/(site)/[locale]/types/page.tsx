import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { RESULT_CATEGORIES, type Locale } from '@/lib/constants';
import { TYPE_STYLE, cardLineOf } from '@/lib/shareCardStyle';
import { alternatesFor } from '@/lib/seoAlternates';

/** Page copy, hoisted out of the component so generateMetadata can reuse it —
 *  this page was the only indexable route with no metadata of its own, so both
 *  /types URLs shipped the home page's title and description verbatim. */
function typesCopy(isZh: boolean) {
  return {
    eyebrow: isZh ? '綠領人才類型' : 'Green career types',
    title: isZh ? '8 種綠領人才，你是哪一種？' : 'Eight green-career types. Which one are you?',
    subtitle: isZh
      ? '每一種，都是市場現在讀你的一種方式。花 5 分鐘，看看你被讀成哪一種，以及怎麼往上一格。'
      : 'Each one is a way the market reads you right now. Take 5 minutes to see which you are — and how to move up a band.',
    cta: isZh ? '免費測我的類型' : 'Test my type — free',
    /** Secondary, deliberately quiet: the eight /types/[category] pages had zero
     *  site-internal entry points. Every one of the eight cards pointed at /mri,
     *  so the SEO landing pages were reachable only from a shared result link or
     *  from Google. This gives each card one small door to its own page without
     *  putting a second competing CTA next to the primary one. */
    detail: isZh ? '看這型的完整說明' : 'Read the full profile',
    footnote: isZh
      ? '分析你貼上的資料，不猜、不評分你這個人。'
      : 'Based on the material you paste — no guessing, no scoring you as a person.',
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = typesCopy(locale === 'zh-TW');
  return {
    title: t.title,
    description: t.subtitle,
    alternates: alternatesFor(locale as Locale, '/types'),
  };
}

/**
 * Public "which type are you?" gallery — a discovery/curiosity surface for the 8
 * archetypes that funnels into the MRI. Mirrors the shareable card styling so the
 * page, the on-screen result card, and the /og/share images all feel like one set.
 */
export default async function TypesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const isZh = L === 'zh-TW';

  const t = typesCopy(isZh);

  return (
    // <main>, so the header's skip link has a target and the page's own <header>
    // stops competing with the site header for the banner landmark.
    <main id="main" className="min-h-screen">

      <header className="mx-auto max-w-3xl px-6 pb-10 pt-8">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t.subtitle}</p>
        <a href={`/${L}/mri`} className="mt-7 inline-block rounded-lg bg-pine px-6 py-3 text-paper">
          {t.cta}
        </a>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {RESULT_CATEGORIES.map((cat) => {
            const type = c.share.types[cat];
            const style = TYPE_STYLE[cat];
            return (
              // A <div>, not an <a>: the card now holds TWO destinations, and an
              // anchor cannot legally contain another anchor. Whole-card
              // clickability is preserved by stretching the primary link's
              // ::after over the card (hence `relative` here); the secondary
              // link sits above that overlay on z-10.
              <div
                key={cat}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-sm transition hover:shadow-md"
              >
                {/* The type's identity signal. The emoji tile that used to sit
                    inside the card is gone: eight cartoon motifs on a paper-and-
                    pine page were the loudest thing in the gallery and they said
                    less than this bar does. The accent colour is the same one
                    the heading and the OG image use, so the set still reads as
                    one cast. 10px matches the /types/[category] card. */}
                <div style={{ height: 10, background: style.accent }} />
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold leading-snug" style={{ color: style.accent }}>
                    {type.label}
                  </h2>
                  <p className="mt-2 max-w-[35rem] text-sm leading-relaxed text-ink-soft">
                    {cardLineOf(type.shareLine)}
                  </p>
                  {/* mt-auto: the CTA pair sits on the card floor, so all eight
                      cards line up however long the line above runs. */}
                  <a
                    href={`/${L}/mri`}
                    // Eight links reading only 「免費測我的類型」 are eight
                    // identical accessible names in a screen reader's link list.
                    aria-label={isZh ? `${t.cta}（${type.label}）` : `${t.cta} (${type.label})`}
                    className="mt-auto pt-4 text-sm font-medium text-pine underline-offset-2 after:absolute after:inset-0 after:content-[''] group-hover:underline"
                  >
                    {t.cta} →
                  </a>
                  <a
                    href={`/${L}/types/${cat}`}
                    aria-label={isZh ? `${t.detail}（${type.label}）` : `${t.detail} (${type.label})`}
                    className="relative z-10 inline-flex min-h-11 items-center self-start text-xs text-ink-soft underline-offset-2 hover:text-pine hover:underline"
                  >
                    {t.detail} →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 max-w-[35rem] text-sm text-ink-soft">{t.footnote}</p>
      </section>
    </main>
  );
}
