import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { REPORT_SECTION_KEYS, type Locale } from '@/lib/constants';
import { displayPrice, FREE_OFFER_ID, PUBLIC_PAID_OFFER_IDS } from '@/lib/services';
import { LatestContent } from '@/components/LatestContent';
import { FounderAvatar } from '@/components/FounderAvatar';
import { LineActions } from '@/components/LineActions';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { newsletterCopy } from '@/content/newsletter';
import { navCopy } from '@/content/nav';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);
  const L = locale as Locale;
  const t = c.reportTemplates;

  // Free tools = the "map" layer of the product map: everyone gets the map for
  // free; only customisation is paid.
  const tools = [
    {
      href: `/${L}/salary-index`,
      title: L === 'zh-TW' ? '綠領揭薪指數' : 'Posted-Salary Index',
      desc:
        L === 'zh-TW'
          ? '職缺頁上真的寫出來的薪水。樣本不足的格子照樣列出，不補數字。'
          : 'Salaries job postings actually printed. Cells without enough samples stay empty.',
    },
    {
      href: `/${L}/jobs`,
      title: L === 'zh-TW' ? '綠領職缺雷達' : 'Green-Collar Jobs Radar',
      desc:
        L === 'zh-TW'
          ? '四區真職缺、薪資帶，還有我們的點評，每週更新。'
          : 'Real openings across four markets, salary bands and our take, refreshed weekly.',
    },
    {
      href: `/${L}/jd`,
      title: L === 'zh-TW' ? 'JD 翻譯器' : 'JD Translator',
      desc:
        L === 'zh-TW'
          ? '貼一則職缺，看它真正要什麼硬技能、薪水大概落在哪。'
          : 'Paste a job ad and see the hard skills it really wants, plus the likely band.',
    },
    {
      href: `/${L}/mba-roi`,
      title: L === 'zh-TW' ? 'MBA ROI 計算器' : 'MBA ROI Calculator',
      desc:
        L === 'zh-TW'
          ? '把學費、機會成本、獎學金算開，看幾年才回得了本。'
          : 'Tuition, opportunity cost and scholarship laid out: when does it actually pay back.',
    },
    {
      href: `/${L}/cost-of-living`,
      title: L === 'zh-TW' ? '異地生活成本' : 'Cost of Living',
      desc:
        L === 'zh-TW'
          ? '薪水多兩三倍，扣掉房租水電之後，實際還剩多少。'
          : 'Pay looks 2–3× higher. What actually survives rent and bills?',
    },
  ];

  return (
    <div className="min-h-screen">

      {/*
        FIRST SCREEN — one sentence, one button (founder decision, 2026-07-30).
        It previously carried eleven competing first-order exits: the flagship
        card, two CTAs, a types link, the band glyph, a credibility line, a time
        promise and a privacy line, plus a four-tool grid immediately below. At
        146 visitors a month there is no budget for a visitor to choose. The h1
        stays because it is the page's SEO asset; everything else moved down one
        screen, in the same order, with nothing deleted.
      */}
      <header className="mx-auto max-w-3xl px-6 pb-14 pt-12 sm:pb-20 sm:pt-16">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{c.landing.hero.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{c.landing.hero.title}</h1>
        <a
          href={`/${L}/mri?utm_source=home&utm_medium=hero`}
          className="mt-10 inline-block w-full rounded-lg bg-pine px-7 py-3.5 text-center text-paper sm:w-auto"
        >
          {c.landing.hero.cta}
        </a>
        <p className="mt-3 text-sm text-ink-soft">{c.landing.hero.timePromise}</p>
      </header>

      {/*
        SECOND SCREEN — the three decision moments, sharing content/nav.ts with
        the site header so the doors can never drift apart.
      */}
      <section className="border-y border-line bg-mist/20">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="max-w-2xl text-lg text-ink-soft">{c.landing.hero.subtitle}</p>
          <p className="mt-10 text-xs uppercase tracking-eyebrow text-pine">
            {L === 'zh-TW' ? '你現在在哪一格' : 'Where you are right now'}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {navCopy[L].doors.map((d) => (
              <a
                key={d.href}
                href={`/${L}${d.href}?utm_source=home&utm_medium=door`}
                className="flex flex-col rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-pine"
              >
                <span className="text-sm font-semibold leading-snug">{d.label}</span>
                <span className="mt-2 text-xs text-ink-soft">{d.hint}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`/${L}/sample`}
              className="rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
            >
              {c.landing.hero.secondaryCta}
            </a>
            <a href={`/${L}/types`} className="text-sm text-pine underline-offset-2 hover:underline">
              {L === 'zh-TW' ? '或先看看 8 種綠領人才類型 →' : 'Or browse the 8 green-career types →'}
            </a>
          </div>

          <p className="mt-6 text-base font-medium text-pine">{c.landing.hero.credibilityLine}</p>
          <p className="mt-3 max-w-2xl text-sm text-ink-soft">{c.landing.hero.privacyLine}</p>

          {/* signature: the band scale glyph */}
          <div className="mt-8 flex items-end gap-1.5" aria-hidden>
            <span className="h-4 w-10 rounded-sm bg-band-emerging" />
            <span className="h-6 w-10 rounded-sm bg-band-developing" />
            <span className="h-9 w-10 rounded-sm bg-band-strong" />
          </div>
        </div>
      </section>

      {/* Judgment flagship — kept whole, moved below the doors. */}
      <section className="mx-auto max-w-3xl px-6 pt-12">
        <a
          href={`/${L}/judgment?utm_source=home&utm_medium=flagship`}
          className="block rounded-2xl bg-pine px-6 py-5 text-paper transition hover:bg-pine-deep"
        >
          <p className="text-xs uppercase tracking-eyebrow text-sage-soft">
            {L === 'zh-TW' ? '免費 · 不用留 email' : 'Free · no email'}
          </p>
          <p className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">
            {L === 'zh-TW' ? '綠領判斷力：你缺的不是知識，是判斷' : 'Green-Collar Judgment: it was never the knowledge'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sage-soft">
            {L === 'zh-TW'
              ? '12 題判斷練習，先作答才看得到解答。每個錯的選項都會告訴你它為什麼誘人。'
              : '12 judgment exercises. You commit before seeing any reasoning, and every wrong option explains why it was tempting.'}
          </p>
          <span className="mt-4 inline-block rounded-lg bg-paper px-4 py-2 text-sm font-medium text-pine">
            {L === 'zh-TW' ? '開始練習' : 'Start practising'}
          </span>
        </a>
      </section>

      {/* free tools — everyone gets the map for free; only customisation is paid */}
      <section className="mx-auto max-w-3xl px-6 pb-4 pt-12">
        <p className="text-xs uppercase tracking-eyebrow text-pine">
          {L === 'zh-TW' ? '免費工具 · 給你一張地圖' : 'Free tools · your map'}
        </p>

        <a
          href={`/${L}/salary-report`}
          className="mt-3 block rounded-2xl border border-pine/30 bg-mist/50 px-6 py-6 transition hover:border-pine"
        >
          <h2 className="text-xl font-semibold leading-snug">
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

        {/* the salary report's sequel — what you're worth → how to become worth more */}
        <a
          href={`/${L}/levelup`}
          className="mt-3 block rounded-2xl border border-pine/30 bg-mist/50 px-6 py-6 transition hover:border-pine"
        >
          <h2 className="text-xl font-semibold leading-snug">
            {L === 'zh-TW'
              ? '《綠領晉級地圖 2026 H2》：哪個技能、哪張證照後面真的有錢？'
              : 'Green-Collar Level-Up Map 2026 H2: which skills and certificates actually pay?'}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {L === 'zh-TW'
              ? '唯一有乾淨溢價數字的技能（碳核算 × Scope 3 +12 到 18%）、證照買到的是門不是加薪，以及三種人各自的兩年路線。'
              : 'The one skill with a clean premium (carbon accounting × Scope 3, +12–18%), why certificates buy the door and not the raise, and two-year routes for three profiles.'}
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-pine">
            {L === 'zh-TW' ? '打開地圖 →' : 'Open the map →'}
          </span>
        </a>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="rounded-2xl border border-line px-5 py-4 transition hover:border-pine"
            >
              <p className="font-semibold">{tool.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{tool.desc}</p>
              <span className="mt-2 inline-block text-sm font-medium text-pine">→</span>
            </a>
          ))}
        </div>
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
                  ? '這不是匿名服務，在 LinkedIn 上找得到我本人 ↗'
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

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {([FREE_OFFER_ID, ...PUBLIC_PAID_OFFER_IDS] as const).map((id) => {
            const offer = c.paidOffers.offers[id];
            const price = displayPrice(id, L) ?? offer.price ?? '';
            return (
              <div key={id} className="flex flex-col rounded-xl border border-line bg-paper p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{offer.name}</h3>
                  <span className="shrink-0 text-sm font-medium text-pine">{price}</span>
                </div>
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
          {/* Secondary rail for the not-yet-convinced: a zero-pressure LINE line.
              Kept light so it never competes with the primary MRI CTA. */}
          <div className="mx-auto mt-8 max-w-md text-left">
            <LineActions
              title={c.flow.line.landingTitle}
              body={c.flow.line.landingBody}
              addLabel={c.flow.line.addCta}
              context="landing"
            />
          </div>
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
