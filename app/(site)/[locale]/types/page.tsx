import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { RESULT_CATEGORIES, type Locale } from '@/lib/constants';
import { TYPE_STYLE, cardLineOf } from '@/lib/shareCardStyle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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

  const t = {
    eyebrow: isZh ? '綠領人才類型' : 'Green career types',
    title: isZh ? '8 種綠領人才，你是哪一種？' : 'Eight green-career types. Which one are you?',
    subtitle: isZh
      ? '每一種，都是市場現在讀你的一種方式。花 5 分鐘，看看你被讀成哪一種——以及怎麼往上一格。'
      : 'Each one is a way the market reads you right now. Take 5 minutes to see which you are — and how to move up a band.',
    cta: isZh ? '免費測我的類型' : 'Test my type — free',
    footnote: isZh
      ? '分析你貼上的資料，不猜、不評分你這個人。'
      : 'Based on the material you paste — no guessing, no scoring you as a person.',
  };

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>

      <header className="mx-auto max-w-3xl px-6 pb-10 pt-8">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{t.title}</h1>
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
              <a
                key={cat}
                href={`/${L}/mri`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition hover:shadow-md"
              >
                <div style={{ height: 8, background: style.accent }} />
                <div className="flex flex-1 flex-col p-5">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: style.tint }}
                  >
                    <span style={{ fontSize: 30, lineHeight: 1 }}>{style.emoji}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold leading-snug" style={{ color: style.accent }}>
                    {type.label}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{cardLineOf(type.shareLine)}</p>
                  <span className="mt-4 text-sm font-medium text-pine underline-offset-2 group-hover:underline">
                    {t.cta} →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-ink-soft">{t.footnote}</p>
      </section>
    </div>
  );
}
