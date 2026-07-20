import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import {
  greenJobs,
  greenJobsCopy,
  type MarketKey,
  type WeeklyPick,
  type GreenJobsCopy,
} from '@/content/greenJobs';
import { newsletterCopy } from '@/content/newsletter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NewsletterSignup } from '@/components/NewsletterSignup';

const REGION_FLAG: Record<MarketKey, string> = { SG: '🇸🇬', TW: '🇹🇼', HK: '🇭🇰', UK: '🇬🇧' };

function PickCard({ p, L, t }: { p: WeeklyPick; L: Locale; t: GreenJobsCopy }) {
  return (
    <li className="rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-medium text-pine">
          <span aria-hidden>{REGION_FLAG[p.market]}</span>
          {t.marketNames[p.market]}
        </span>
        <span className="text-xs text-ink-soft">{L === 'zh-TW' ? p.metaZh : p.metaEn}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug sm:text-xl">
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-pine">
          {L === 'zh-TW' ? p.roleZh : p.roleEn}
        </a>
      </h3>
      <p className="mt-1 text-sm text-ink-soft">{p.org}</p>

      {/* salary block */}
      <div className="mt-4 rounded-xl bg-mist/40 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-pine">
          {p.salarySources.length > 0
            ? L === 'zh-TW' ? '薪資帶（估算）' : 'Salary (est.)'
            : L === 'zh-TW' ? '薪資' : 'Salary'}
        </p>
        <p className="mt-1 text-sm tabular-nums">{L === 'zh-TW' ? p.salaryZh : p.salaryEn}</p>
        {p.salarySources.length > 0 && (
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
            <span className="text-ink-soft">{L === 'zh-TW' ? '來源' : 'Sources'}</span>
            {p.salarySources.map((s) => {
              const external = s.url.startsWith('http');
              const href = external ? s.url : `/${L}${s.url}`;
              const label = L === 'en' && s.labelEn ? s.labelEn : s.label;
              return (
                <a
                  key={s.url}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="text-pine underline-offset-2 hover:underline"
                >
                  {label} {external ? '↗' : '→'}
                </a>
              );
            })}
          </p>
        )}
      </div>

      {/* our take — multi-paragraph practitioner analysis */}
      <div className="mt-5 border-l-2 border-pine pl-4">
        <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-pine">
          {L === 'zh-TW' ? '我們的點評' : 'Our take'}
        </p>
        <div className="mt-2 space-y-3">
          {(L === 'zh-TW' ? p.takeZh : p.takeEn).map((para, k) => (
            <p key={k} className="text-[15px] leading-[1.8] text-ink">
              {para}
            </p>
          ))}
        </div>
      </div>

      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
      >
        {L === 'zh-TW' ? '查看職缺 →' : 'View posting →'}
      </a>
    </li>
  );
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = greenJobsCopy[locale as Locale];
  return { title: t.title, description: t.intro };
}

export default async function JobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const t = greenJobsCopy[L];
  const mriHref = `/${L}/mri?utm_source=jobs_radar&utm_medium=on_site&utm_content=cta`;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <div className="flex items-center gap-4">
          <a href={mriHref} className="text-sm text-pine underline-offset-2 hover:underline">
            {t.backToMri}
          </a>
          <LanguageSwitcher current={L} />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{t.title}</h1>
        <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>

        {/* weekly picks */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 className="text-2xl font-semibold tracking-tight">{t.weeklyTitle}</h2>
            <span className="whitespace-nowrap text-xs text-ink-soft">
              {t.updatedPrefix} {greenJobs.updatedAt}
            </span>
          </div>
          {greenJobs.weeklyPicks.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-mist/30 px-5 py-6 text-sm text-ink-soft">
              {t.weeklyEmpty}
            </div>
          ) : (
            <ul className="mt-6 grid gap-6">
              {greenJobs.weeklyPicks.map((p, i) => (
                <PickCard key={i} p={p} L={L} t={t} />
              ))}
            </ul>
          )}
        </section>

        {/* MBA / strategy track — kept separate from the green-collar picks */}
        {greenJobs.mbaPicks.length > 0 && (
          <section className="mt-12">
            <div className="border-b border-line pb-3">
              <h2 className="text-2xl font-semibold tracking-tight">{t.mbaTitle}</h2>
              <p className="mt-1 text-sm text-ink-soft">{t.mbaNote}</p>
            </div>
            <ul className="mt-6 grid gap-6">
              {greenJobs.mbaPicks.map((p, i) => (
                <PickCard key={i} p={p} L={L} t={t} />
              ))}
            </ul>
          </section>
        )}

        {/* newsletter — the return-visit engine */}
        <div className="mt-10">
          <NewsletterSignup locale={L} copy={newsletterCopy[L]} source="jobs_radar" />
        </div>

        {/* markets */}
        <section className="mt-12 grid gap-5">
          {greenJobs.markets.map((m) => (
            <div key={m.key} className="rounded-2xl border border-line bg-paper p-6">
              <h3 className="text-lg font-semibold">{t.marketNames[m.key]}</h3>

              <p className="mt-4 text-xs uppercase tracking-eyebrow text-ink-soft">{t.boardsLabel}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.boards.map((b) => (
                  <a
                    key={b.url}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-pine/40 px-3 py-1.5 text-sm text-pine transition hover:border-pine hover:bg-mist/40"
                  >
                    {b.label} ↗
                  </a>
                ))}
              </div>

              <p className="mt-5 text-xs uppercase tracking-eyebrow text-ink-soft">{t.employersLabel}</p>
              <p className="mt-2 text-sm text-ink-soft">{m.employers.join(' · ')}</p>
            </div>
          ))}
        </section>

        <p className="mt-6 text-xs text-ink-soft">{t.sourceNote}</p>

        {/* CTA to free MRI */}
        <section className="mt-14 rounded-2xl bg-pine px-7 py-9 text-paper">
          <h2 className="text-2xl font-semibold leading-snug">{t.ctaTitle}</h2>
          <p className="mt-3 max-w-xl text-paper/90">{t.ctaBody}</p>
          <a
            href={mriHref}
            className="mt-6 inline-block rounded-lg bg-paper px-6 py-3 font-semibold text-pine"
          >
            {t.ctaButton}
          </a>
        </section>
      </main>
    </div>
  );
}
