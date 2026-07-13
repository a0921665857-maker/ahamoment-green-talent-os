import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { REPORT_SECTION_KEYS, type Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ReturnReportLink } from '@/components/ReturnReportLink';
import { LatestContent } from '@/components/LatestContent';
import { FounderAvatar } from '@/components/FounderAvatar';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { newsletterCopy } from '@/content/newsletter';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);
  const L = locale as Locale;
  const t = c.reportTemplates;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">{c.seo.siteName}</span>
        <div className="flex items-center gap-4">
          <ReturnReportLink locale={L} label={c.landing.hero.viewExistingReport} />
          <LanguageSwitcher current={L} />
        </div>
      </nav>

      {/* hero */}
      <header className="mx-auto max-w-3xl px-6 pb-16 pt-10">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{c.landing.hero.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{c.landing.hero.title}</h1>
        <p className="mt-4 text-base font-medium text-pine">{c.landing.hero.credibilityLine}</p>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">{c.landing.hero.subtitle}</p>

        {/* signature: the band scale glyph */}
        <div className="mt-8 flex items-end gap-1.5" aria-hidden>
          <span className="h-4 w-10 rounded-sm bg-band-emerging" />
          <span className="h-6 w-10 rounded-sm bg-band-developing" />
          <span className="h-9 w-10 rounded-sm bg-band-strong" />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`/${L}/mri`} className="rounded-lg bg-pine px-6 py-3 text-paper">
            {c.landing.hero.cta}
          </a>
          <a
            href={`/${L}/sample`}
            className="rounded-lg border border-pine px-6 py-3 text-pine"
          >
            {c.landing.hero.secondaryCta}
          </a>
        </div>
        <a href={`/${L}/types`} className="mt-4 inline-block text-sm text-pine underline-offset-2 hover:underline">
          {L === 'zh-TW' ? '或先看看 8 種綠領人才類型 →' : 'Or browse the 8 green-career types →'}
        </a>
        <p className="mt-4 text-sm text-ink-soft">{c.landing.hero.timePromise}</p>
        <p className="mt-6 max-w-2xl text-sm text-ink-soft">{c.landing.hero.privacyLine}</p>
      </header>

      {/* salary report lead magnet — prominent, free-to-read entry high on the page */}
      <section className="mx-auto max-w-3xl px-6 pb-4">
        <a
          href={`/${L}/salary-report`}
          className="block rounded-2xl border border-pine/30 bg-mist/50 px-6 py-6 transition hover:border-pine"
        >
          <p className="text-xs uppercase tracking-eyebrow text-pine">
            {L === 'zh-TW' ? '免費閱讀 · 新報告' : 'Free read · New report'}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug">
            {L === 'zh-TW'
              ? '《2026 亞太綠領薪資報告》：同一份工作，新加坡薪水是台灣的 2 到 3 倍？'
              : '2026 APAC Green-Collar Salary Report: is Singapore pay really 2–3× Taiwan’s?'}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {L === 'zh-TW'
              ? '星台薪資帶、綠領溢價 5.3% vs 面試機會 544% 的真相，以及四種拉高議價力的技能組合。'
              : 'Cross-strait bands, the +5.3% pay vs +544% interviews paradox, and four skill combos that lift your leverage.'}
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-pine">
            {L === 'zh-TW' ? '打開報告 →' : 'Open the report →'}
          </span>
        </a>
        <a
          href={`/${L}/jobs`}
          className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-line px-6 py-4 transition hover:border-pine"
        >
          <span className="text-sm">
            <span className="font-semibold">
              {L === 'zh-TW' ? '綠領職缺雷達' : 'Green-Collar Jobs Radar'}
            </span>
            <span className="ml-2 text-ink-soft">
              {L === 'zh-TW'
                ? '亞太綠領職缺該去哪找，一頁整理好，每週更新'
                : 'Where to find APAC green-collar jobs — curated, updated weekly'}
            </span>
          </span>
          <span className="shrink-0 text-sm font-medium text-pine">→</span>
        </a>
      </section>

      {/* differentiator — Blue Ocean category boundary, high on the page */}
      <section className="border-y border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-xl font-semibold">{c.landing.differentiator.title}</h2>
          <ul className="mt-5 space-y-3">
            {c.landing.differentiator.points.map((p, i) => (
              <li key={i} className="flex items-baseline gap-3 text-ink-soft">
                <span className="text-pine">—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how it works — a real 3-step sequence */}
      <section className="border-t border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-xl font-semibold">{c.landing.howItWorks.title}</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {c.landing.howItWorks.steps.map((s, i) => (
              <li key={i}>
                <span className="text-sm tabular-nums text-pine">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-1 font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* what you get — concrete section preview */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-xl font-semibold">{c.landing.whatYouGet.title}</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{c.landing.whatYouGet.intro}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {REPORT_SECTION_KEYS.map((k, i) => (
            <li key={k} className="flex items-baseline gap-3 text-sm">
              <span className="tabular-nums text-pine">{String(i + 1).padStart(2, '0')}</span>
              <span>{t.sections[k].title}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-ink-soft">{c.landing.whatYouGet.sectionPreviewNote}</p>
        <a href={`/${L}/sample`} className="mt-4 inline-block text-sm text-pine hover:underline">
          {c.sample.landingLinkLabel} →
        </a>
      </section>

      {/* founder strip */}
      <section className="border-t border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-xl font-semibold">{c.landing.founder.title}</h2>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <FounderAvatar className="h-24 w-24 shrink-0 rounded-full object-cover ring-1 ring-line" />
            <div>
              <ul className="space-y-2">
                {c.landing.founder.facts.map((f, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-ink-soft">
                    <span className="text-pine">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://www.linkedin.com/in/chao-hsien-wu/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
              >
                {L === 'zh-TW'
                  ? '這不是匿名服務——在 LinkedIn 上找我本人 ↗'
                  : 'Not an anonymous service — find me on LinkedIn ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* offers — flagship services shown directly on the homepage */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-xl font-semibold">{c.landing.offersTeaser.title}</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{c.landing.offersTeaser.intro}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(['intro_call_free', 'deep_read', 'teardown_90', 'full_package'] as const).map((id) => {
            const offer = c.paidOffers.offers[id];
            return (
              <div key={id} className="flex flex-col rounded-xl border border-line bg-paper p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{offer.name}</h3>
                  <span className="shrink-0 text-sm font-medium text-pine">{offer.price}</span>
                </div>
                {offer.priceNote && <p className="mt-2 text-xs text-pine">{offer.priceNote}</p>}
                <p className="mt-2 text-sm text-ink-soft">{offer.blurb}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-6 max-w-2xl text-sm text-ink-soft">{c.paidOffers.bookingNote}</p>
        <a href={`/${L}/services`} className="mt-4 inline-block text-sm text-pine hover:underline">
          {c.landing.offersTeaser.allServicesCta} →
        </a>
        <p className="mt-6 max-w-2xl text-sm text-ink-soft">{c.landing.offersTeaser.honestUrgency}</p>
      </section>

      {/* final cta */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">{c.landing.finalCta.title}</h2>
          <p className="mt-3 text-ink-soft">{c.landing.finalCta.body}</p>
          <a href={`/${L}/mri`} className="mt-6 inline-block rounded-lg bg-pine px-6 py-3 text-paper">
            {c.landing.finalCta.cta}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <NewsletterSignup locale={L} copy={newsletterCopy[L]} source="landing" />
      </section>

      <LatestContent locale={L} />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>{c.landing.footer.rightsLine}</span>
          <div className="flex items-center gap-4">
            {process.env.NEXT_PUBLIC_BLOG_URL && (
              <a
                href={process.env.NEXT_PUBLIC_BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pine"
              >
                {c.landing.footer.blogLink}
              </a>
            )}
            <a href={`/${L}/privacy`} className="hover:text-pine">
              {c.landing.footer.privacyLink}
            </a>
          </div>
        </div>
        <p className="mx-auto max-w-3xl px-6 pb-8 text-xs text-ink-soft">{c.landing.footer.deleteLine}</p>
      </footer>
    </div>
  );
}
