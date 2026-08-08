import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { alternatesFor } from '@/lib/seoAlternates';
import { REPORT_SECTION_KEYS, type Locale } from '@/lib/constants';
import { displayPrice, FREE_OFFER_ID, PUBLIC_PAID_OFFER_IDS } from '@/lib/services';
import { LatestContent } from '@/components/LatestContent';
import { FounderAvatar } from '@/components/FounderAvatar';
import { LineActions } from '@/components/LineActions';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { LandingAnalytics } from '@/components/LandingAnalytics';
import { MobileStickyCta } from '@/components/MobileStickyCta';
import { newsletterCopy } from '@/content/newsletter';
import { levelupName } from '@/content/levelup';
import { navCopy, doorHref } from '@/content/nav';

/** Title and description are inherited from the layout defaults; this exists so
 *  the home page can declare its own canonical and hreflang pair. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { alternates: alternatesFor(locale as Locale, '') };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);
  const L = locale as Locale;
  const zh = L === 'zh-TW';
  const t = c.reportTemplates;

  /** Every mainline entry on this page, tagged by where on the page it sits.
   *  The final CTA used to be a bare `/mri` with no parameters at all, so the
   *  page's closing ask was the one entry that could never be counted. */
  const mri = (medium: string) => `/${L}/mri?utm_source=home&utm_medium=${medium}`;

  // Free tools = the "map" layer of the product map: everyone gets the map for
  // free; only customisation is paid.
  const tools = [
    {
      href: `/${L}/salary-index`,
      title: zh ? '綠領揭薪指數' : 'Posted-Salary Index',
      desc: zh
        ? '職缺頁上真的寫出來的薪水。樣本不足的格子照樣列出，不補數字。'
        : 'Salaries job postings actually printed. Cells without enough samples stay empty.',
    },
    {
      href: `/${L}/jobs`,
      title: zh ? '綠領職缺雷達' : 'Green-Collar Jobs Radar',
      desc: zh
        ? '四區真職缺、薪資帶，還有我們的點評。每一批精選都標更新日期。'
        : 'Real openings across four markets, salary bands and our take. Every batch of picks carries its update date.',
    },
    {
      href: `/${L}/jd`,
      title: zh ? 'JD 翻譯器' : 'JD Translator',
      desc: zh
        ? '貼一則職缺，看它真正要什麼硬技能、薪水大概落在哪。'
        : 'Paste a job ad and see the hard skills it really wants, plus the likely band.',
    },
    {
      href: `/${L}/mba-roi`,
      title: zh ? 'MBA ROI 計算器' : 'MBA ROI Calculator',
      desc: zh
        ? '把學費、機會成本、獎學金算開，看幾年才回得了本。'
        : 'Tuition, opportunity cost and scholarship laid out: when does it actually pay back.',
    },
    {
      href: `/${L}/cost-of-living`,
      title: zh ? '異地生活成本' : 'Cost of Living',
      desc: zh
        ? '薪水多兩三倍，扣掉房租水電之後，實際還剩多少。'
        : 'Pay looks 2–3× higher. What actually survives rent and bills?',
    },
  ];

  return (
    // <main>, not <div>: the header's skip link points at #main, and without a
    // sectioning ancestor the hero <header> and the page-local <footer> below
    // were promoted to a SECOND banner and contentinfo alongside the site chrome.
    //
    // No bottom padding for the sticky bar below it: SiteFooter follows <main>,
    // so nothing inside <main> can ever be the thing under the bar, and padding
    // here would be 96px of dead space that fixes nothing. (The bar does overlap
    // the footer's last row at full scroll — same as the report page, and the
    // fix for it belongs to the layout, not to this page.)
    <main id="main" className="min-h-screen">
      {/* Measurement, mounted first and deliberately before the restructure below
          it, so the reordering has a same-instrument before and after. */}
      <LandingAnalytics locale={L} />

      {/*
        FIRST SCREEN — one sentence, one button (founder decision, 2026-07-30).
        It previously carried eleven competing first-order exits; the h1 stays
        because it is the page's SEO asset, everything else moved down one screen.

        Two changes from the 2026-08-08 audit, both about the same defect — the
        first screen asked for a click before saying what the click costs:
          · the lede moved up from the doors screen to sit between the h1 and the
            button, because "it reads what you already have" IS the price, and it
            was one screen below the place the decision gets made;
          · the button names the price in its own label, so the answer travels
            with the button even for a reader who skips prose.
        And the 105px of dead air under the button (pb-14 + the next section's
        py-12) is now 72px: the button was floating alone with the fold under it.
      */}
      <header className="mx-auto max-w-3xl px-6 pb-6 pt-12 sm:pb-8 sm:pt-16">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{c.landing.hero.eyebrow}</p>
        {/* text-balance: without it the zh h1 broke the compound 「定位」 across
            lines and orphaned one character on a 22%-filled last line at 375px.
            Block height is identical either way, so nothing below shifts. */}
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-balance sm:text-5xl">
          {c.landing.hero.title}
        </h1>
        {/* Written here rather than read from content/: hero.subtitle is a single
            unsplittable sentence and it still renders in full one screen down, so
            there is nothing to slice. This is the one clause a reader needs
            before deciding, in its own words. */}
        <p className="mt-5 max-w-[35rem] text-lg leading-relaxed text-ink-soft">
          {zh
            ? '它讀你已經有的東西：CV、LinkedIn，或一份職涯筆記。不用重打一次你的經歷。'
            : 'It reads what you already have: a CV, a LinkedIn profile, or a page of career notes. Nothing to retype.'}
        </p>
        <a
          href={mri('hero')}
          data-cta="mri"
          data-placement="hero"
          className="mt-6 inline-block w-full rounded-lg bg-pine px-7 py-3.5 text-center text-paper sm:w-auto"
        >
          {c.landing.hero.cta}
          {/* The cost, inside the label. Kept as a separate span so the sentence
              stays legible if it wraps at 375px, and so content/ still owns the
              verb — hero.cta is also the report page's home link. */}
          <span className="text-paper/80">{zh ? '（用你現成的資料）' : ' (with what you already have)'}</span>
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
          {/* an <h2>, not a <p>: the whole doors screen was invisible to heading
              navigation. Renders identically — house precedent is SiteFooter's
              eyebrow-styled <h2>站內索引</h2>. */}
          <h2 className="mt-10 text-xs uppercase tracking-eyebrow text-pine">
            {zh ? '你現在在哪一格' : 'Where you are right now'}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {navCopy[L].doors.map((d) => (
              <a
                key={d.href}
                href={doorHref(L, d.href, 'door-mobile')}
                data-door="door-mobile"
                data-href={d.href}
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
              data-cta="sample"
              data-placement="doors"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
            >
              {c.landing.hero.secondaryCta}
            </a>
            <a
              href={`/${L}/types`}
              data-cta="types"
              data-placement="doors"
              className="text-sm text-pine underline-offset-2 hover:underline"
            >
              {zh ? '或先看看 8 種綠領人才類型 →' : 'Or browse the 8 green-career types →'}
            </a>
          </div>

          <p className="mt-6 text-base font-medium text-pine">{c.landing.hero.credibilityLine}</p>
          <p className="mt-3 max-w-[35rem] text-sm text-ink-soft">{c.landing.hero.privacyLine}</p>

          {/* signature: the band scale glyph */}
          <div className="mt-8 flex items-end gap-1.5" aria-hidden>
            <span className="h-4 w-10 rounded-sm bg-band-emerging" />
            <span className="h-6 w-10 rounded-sm bg-band-developing" />
            <span className="h-9 w-10 rounded-sm bg-band-strong" />
          </div>
        </div>
      </section>

      {/* Judgment — kept whole and kept here, but demoted from a full pine block
          to the same outlined card the other free resources use (2026-08-08
          audit). The site has very few solid-pine primary buttons; this one held
          the best-positioned of them and spent it on a practice module rather
          than on the diagnostic the whole funnel is built around. It is still
          the first thing after the doors, and it still says free and no email. */}
      <section className="mx-auto max-w-3xl px-6 pt-12">
        <a
          href={`/${L}/judgment?utm_source=home&utm_medium=flagship`}
          data-cta="judgment"
          data-placement="flagship"
          className="block rounded-xl border border-pine/30 bg-mist/50 px-6 py-6 transition hover:border-pine"
        >
          <p className="text-xs uppercase tracking-eyebrow text-pine">
            {zh ? '免費 · 不用留 email' : 'Free · no email'}
          </p>
          {/* an <h2>: this card had no heading at all. font-semibold stays
              explicit because Preflight sets h2 font-weight:inherit. 20px is the
              house card-title size; 24px is reserved for SECTION headings. */}
          <h2 className="mt-2 text-xl font-semibold leading-snug">
            {zh
              ? '綠領判斷力：知識查得到，判斷你得自己練'
              : 'Green-Collar Judgment: knowledge you can look up. Judgment you practise.'}
          </h2>
          <p className="mt-2 max-w-[35rem] text-sm leading-relaxed text-ink-soft">
            {zh
              ? '12 題判斷練習，先作答才看得到解答。每個錯的選項都會告訴你它為什麼誘人。'
              : '12 judgment exercises. You commit before seeing any reasoning, and every wrong option explains why it was tempting.'}
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-pine">
            {zh ? '開始練習 →' : 'Start practising →'}
          </span>
        </a>
      </section>

      {/* differentiator — Blue Ocean category boundary, high on the page */}
      <section className="border-y border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* 24px is the house SECTION size (cost-of-living, levelup,
              salary-report, jobs all ship it). The home page was the outlier at
              20px, which made every section heading the same size as the card
              titles inside it — so the page read as one flat list of cards with
              no spine. Card titles stay at 20px; only sections moved. */}
          <h2 className="text-2xl font-semibold">{c.landing.differentiator.title}</h2>
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
          <h2 className="text-2xl font-semibold">{c.landing.howItWorks.title}</h2>
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
        <h2 className="text-2xl font-semibold">{c.landing.whatYouGet.title}</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{c.landing.whatYouGet.intro}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {REPORT_SECTION_KEYS.map((k, i) => (
            <li key={k} className="flex items-baseline gap-3 text-sm">
              <span className="tabular-nums text-pine">{String(i + 1).padStart(2, '0')}</span>
              <span>{t.sections[k].title}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-[35rem] text-sm text-ink-soft">{c.landing.whatYouGet.sectionPreviewNote}</p>
        <a
          href={`/${L}/sample`}
          data-cta="sample"
          data-placement="what_you_get"
          className="mt-4 inline-block text-sm text-pine hover:underline"
        >
          {c.sample.landingLinkLabel} →
        </a>
      </section>

      {/* MID-PAGE MAINLINE ENTRY (2026-08-08 audit).
          The gap between the first door and the next way into the diagnostic was
          6,389px — 7.9 screens on a phone — and the page's three most persuasive
          blocks all sat inside it. This is the entry that gap was missing, placed
          at the highest-intent moment on the page: directly after the reader has
          just read what the report actually contains. */}
      <section className="border-y border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="max-w-[35rem] text-lg">
            {zh
              ? '上面這些都是通則。你自己那一份會寫成什麼樣，從這裡開始。'
              : 'Everything above is the general case. To see what yours says, start here.'}
          </p>
          <a
            href={mri('mid_page')}
            data-cta="mri"
            data-placement="mid_page"
            className="mt-6 inline-block w-full rounded-lg bg-pine px-7 py-3.5 text-center text-paper sm:w-auto"
          >
            {c.landing.hero.cta}
          </a>
          <p className="mt-3 text-sm text-ink-soft">
            {zh
              ? '約 5 分鐘，用你已經有的資料，不需註冊。'
              : 'About 5 minutes, from the materials you already have. No account.'}
          </p>
        </div>
      </section>

      {/* founder strip */}
      <section className="border-t border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl font-semibold">{c.landing.founder.title}</h2>
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
                {zh
                  ? '這不是匿名服務，在 LinkedIn 上找得到我本人 ↗'
                  : 'Not an anonymous service — find me on LinkedIn ↗'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* offers — flagship services shown directly on the homepage */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-2xl font-semibold">{c.landing.offersTeaser.title}</h2>
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

        {/* max-w-2xl (672px) is the right measure for 16px prose — 42 zh
            characters. On 14px text the same box runs 48 characters a line, so
            the SMALLEST type on the page had the LONGEST lines. 35rem = 560px =
            40 zh characters at 14px, the ceiling for these two. */}
        <p className="mt-6 max-w-[35rem] text-sm text-ink-soft">{c.paidOffers.bookingNote}</p>
        <a
          href={`/${L}/services`}
          data-cta="services"
          data-placement="offers"
          className="mt-4 inline-block text-sm text-pine hover:underline"
        >
          {c.landing.offersTeaser.allServicesCta} →
        </a>
        <p className="mt-6 max-w-[35rem] text-sm text-ink-soft">{c.landing.offersTeaser.honestUrgency}</p>
      </section>

      {/* final cta */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">{c.landing.finalCta.title}</h2>
          <p className="mt-3 text-ink-soft">{c.landing.finalCta.body}</p>
          <a
            href={mri('final')}
            data-cta="mri"
            data-placement="final"
            className="mt-6 inline-block rounded-lg bg-pine px-6 py-3 text-paper"
          >
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

      {/* FREE TOOLS — the whole block, unchanged, moved here from three screens
          below the hero (2026-08-08 audit). Seven links out of the funnel used to
          sit between the doors and every argument for taking the diagnostic, so
          the reader met the exits before the reasons. Nothing was deleted: this
          is now the "not ready to start" tail, alongside the newsletter and the
          latest posts, and it sits after the services block as instructed. */}
      <section className="mx-auto max-w-3xl px-6 pb-4 pt-12">
        <p className="text-xs uppercase tracking-eyebrow text-pine">
          {zh ? '免費工具 · 給你一張地圖' : 'Free tools · your map'}
        </p>

        <a
          href={`/${L}/salary-report`}
          data-cta="salary_report"
          data-placement="free_tools"
          className="mt-3 block rounded-xl border border-pine/30 bg-mist/50 px-6 py-6 transition hover:border-pine"
        >
          <h2 className="text-xl font-semibold leading-snug">
            {zh
              ? '《2026 亞太綠領薪資報告》：同一份工作，新加坡薪水是台灣的 2 到 3 倍？'
              : '2026 APAC Green-Collar Salary Report: is Singapore pay really 2–3× Taiwan’s?'}
          </h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">
            {zh
              ? '星台薪資帶、綠領溢價 5.3% vs 面試機會 544% 的真相，以及四種拉高議價力的技能組合。'
              : 'Cross-strait bands, the +5.3% pay vs +544% interviews paradox, and four skill combos that lift your leverage.'}
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-pine">
            {zh ? '打開報告 →' : 'Open the report →'}
          </span>
        </a>

        {/* the salary report's sequel — what you're worth → how to become worth more */}
        <a
          href={`/${L}/levelup`}
          data-cta="levelup"
          data-placement="free_tools"
          className="mt-3 block rounded-xl border border-pine/30 bg-mist/50 px-6 py-6 transition hover:border-pine"
        >
          {/* The edition comes from content/levelup.ts, never from this file:
              it used to be typed here as well, so cutting a new edition meant
              the front door could advertise one and the report be another. */}
          <h2 className="text-xl font-semibold leading-snug">
            {zh
              ? `《${levelupName['zh-TW']}》：哪個技能、哪張證照後面真的有錢？`
              : `${levelupName.en}: which skills and certificates actually pay?`}
          </h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">
            {zh
              ? '唯一有乾淨溢價數字的技能（碳核算 × Scope 3 +12 到 18%）、證照買到的是門不是加薪，以及三種人各自的兩年路線。'
              : 'The one skill with a clean premium (carbon accounting × Scope 3, +12–18%), why certificates buy the door and not the raise, and two-year routes for three profiles.'}
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-pine">
            {zh ? '打開地圖 →' : 'Open the map →'}
          </span>
        </a>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              data-cta="tool"
              data-placement="free_tools"
              className="rounded-xl border border-line px-5 py-4 transition hover:border-pine"
            >
              <p className="font-semibold">{tool.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{tool.desc}</p>
              <span className="mt-2 inline-block text-sm font-medium text-pine">→</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <NewsletterSignup locale={L} copy={newsletterCopy[L]} source="landing" />
      </section>

      <LatestContent locale={L} />

      {/*
        The page-local <footer> that used to sit here is gone. SiteFooter (in the
        locale layout) already carries all four of its payloads, so the home page
        was showing every visitor two footers in a row:
          · privacy link  → SiteFooter's 站內索引 group ships /privacy
          · delete promise → SiteFooter reads the same landing.footer.deleteLine
          · blog link      → LatestContent's 「看更多文章」 sits directly above,
                             and the blog is zh-only content anyway
          · rights line    → the wordmark; belongs in the site chrome, not on one
                             page (handed to agent-components for SiteFooter)
        Nothing here is orphaned: /privacy and the blog both still have a live
        in-page entry above this point.
      */}

      {/* Mobile-only floating entry. Same component, same scrollY > 600 trigger
          and same calm bar as the report — the home page is 12 screens on a
          phone and a reader who decides on screen 5 had nothing to tap. Not a
          pop-up: it slides up from the floor, never covers the content it is
          about, and does not interrupt. */}
      <MobileStickyCta surface="landing" href={mri('sticky_mobile')} ctaLabel={c.landing.hero.cta} />
    </main>
  );
}
