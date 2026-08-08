import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { ctaOffers } from '@/lib/scoring/resultClassifier';
import { getReportByToken, getSessionStatusByToken } from '@/lib/reportData';
import { getPersonalBand } from '@/lib/salaryBands';
import { localeRedirectPath } from '@/lib/reportView';
import { ScrollDepth } from '@/components/ScrollDepth';
import { InlineCtaCard } from '@/components/InlineCtaCard';
import { MriLiteReport } from '@/components/MriLiteReport';
import { PaidOfferCta } from '@/components/PaidOfferCta';
import { ShareableTypeCard } from '@/components/ShareableTypeCard';
import { ReportPending } from '@/components/ReportPending';
import { LineActions } from '@/components/LineActions';
import { MobileStickyCta } from '@/components/MobileStickyCta';
import { MarketPulseCard } from '@/components/MarketPulseCard';
import { calendlyWithContext } from '@/lib/bookingUrl';
import { profileFactLine } from './profileFacts';

export const dynamic = 'force-dynamic';

/**
 * Page-local UI strings (same precedent as MATERIAL_UI in MriIntakeFlow): one
 * new line, added with the layout change it belongs to. Move into the content
 * contract next time content/schema.ts is opened.
 *
 * `bookmarkNote` is the desktop replacement for the LINE save rail. The rail
 * exists because the Threads in-app browser has no tabs and no history — a
 * mobile-only problem that was nevertheless rendering 228px of non-report
 * content above the report title on desktop too.
 */
const RESULT_UI: Record<Locale, { bookmarkNote: string }> = {
  'zh-TW': { bookmarkNote: '這個連結永久有效，可以直接加入書籤，之後隨時回來看。' },
  en: { bookmarkNote: 'This link stays live. Bookmark it and come back whenever you want.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getContent(locale).seo.titles.result, robots: { index: false } };
}

function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (locale === 'zh-TW') return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);

  const report = await getReportByToken(token);
  if (!report) {
    // No report yet — distinguish "still generating" (poll) from "not found".
    const sess = await getSessionStatusByToken(token);
    if (sess && sess.status !== 'failed') {
      return (
        <div className="min-h-screen">
          <main id="main" className="mx-auto max-w-2xl px-6 pb-24 pt-6">
            <ReportPending
              token={token}
              title={c.flow.progress.report.title}
              stages={c.flow.progress.report.stages}
              note={c.flow.progress.report.note}
              failedMessage={c.errors.generic}
              homeHref={`/${L}/mri`}
              homeLabel={c.landing.hero.cta}
            />
            {/* The 3–5 minute wait is the highest-abandon moment on a commute;
                give the reader the same LINE bookmark the flow's generating
                phase offers (walkthrough follow-up). */}
            <LineActions
              title={c.flow.line.generatingHint}
              saveLabel={c.flow.line.saveCta}
              shareText={c.flow.line.shareTextReport}
              sharePath={`/${L}/result/${token}?utm_source=line_self&utm_medium=save`}
              context="generating"
            />
          </main>
        </div>
      );
    }
    return (
      // The one branch of this route with no <main> and no h1 at all: the skip
      // link died and a screen reader landed on an unheaded page. Preflight
      // neutralises h1 sizing, so this is a landmark/outline fix, not a restyle.
      <main id="main" className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-ink">{c.errors.notFound}</h1>
        <a href={`/${L}/mri`} className="mt-4 inline-block text-pine hover:underline">
          {c.landing.hero.cta}
        </a>
      </main>
    );
  }

  // The report is generated in one locale; if the URL locale differs (e.g. someone
  // flipped the language switcher), redirect to the report's own locale so the body
  // and UI never end up in mixed languages.
  const localeRedirect = localeRedirectPath(report.locale, L, token);
  if (localeRedirect) redirect(localeRedirect);

  const slots = ctaOffers({
    category: report.category,
    primary_offer: report.primaryOffer,
    secondary_offer: report.secondaryOffer,
  });
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';
  // Payment links are resolved per service × market inside lib/services.ts —
  // the old single `deep_read` link is gone with the offer it belonged to.

  // Personalised salary band: a deterministic lookup against the human-curated
  // salary-report dataset (lib/salaryBands.ts). Never guessed, never LLM. When the
  // person's sectors/years don't map cleanly this is null and the block is simply
  // absent — the generic card that used to take its place said nothing about the
  // reader and spent a screen of attention on the way to the CTA (MarketPulseCard
  // has the same rule: disappear rather than go stale).
  const band =
    report.profileConfidence >= 0.4
      ? getPersonalBand(report.sectors, report.yearsExperience, L)
      : null;
  const marketUtm = `utm_source=mri_report&utm_medium=pricing_block&utm_content=${band ? 'personal_band' : 'generic'}`;

  return (
    <div className="min-h-screen">
      <ScrollDepth surface="report" extra={{ category: report.category, locale: L }} />
      <main id="main" className="mx-auto max-w-2xl px-6 pb-28 pt-6 sm:pb-24">
        {report.degraded && (
          <p className="mb-6 max-w-[37rem] rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink-soft">
            {c.errors.reportDegraded}
          </p>
        )}
        <MriLiteReport
          locale={L}
          name={report.name}
          sections={report.sections}
          bands={report.bands}
          limitedData={report.limitedData}
          templates={c.reportTemplates}
          dateLabel={formatDate(report.createdAt, L)}
          mbaIntent={report.mbaIntent}
          /* The answer, first screen. The type name previously debuted on screen
             10.4 of 13.3, below the conversion zone. The fact line is a
             deterministic restatement of the reader's own extracted profile —
             never the share-card line, which is identical for every reader of
             the same type ("specific beats flattering"). */
          typeSummary={{
            eyebrow: c.reportTemplates.categoryLabel,
            label: c.share.types[report.category].label,
            fact: profileFactLine({
              locale: L,
              sectors: report.sectors,
              domains: report.domains,
              yearsExperience: report.yearsExperience,
              profileConfidence: report.profileConfidence,
            }),
          }}
          /* Was a 228px block above the report title, on every device. Its reason
             for existing is mobile-only (the Threads in-app browser has no tabs
             or history), so on mobile it moves below the first section and keeps
             only the save action; on desktop it becomes one quiet line. This is
             also the LINE convergence: one add-LINE ask on the page, at the foot. */
          afterFirstSection={
            <>
              <div className="sm:hidden">
                <LineActions
                  title={c.flow.line.resultTitle}
                  saveLabel={c.flow.line.saveCta}
                  shareText={c.flow.line.shareTextReport}
                  sharePath={`/${L}/result/${token}?utm_source=line_self&utm_medium=save`}
                  context="report"
                />
              </div>
              <p className="mt-6 hidden max-w-[35rem] text-sm text-ink-soft sm:block">
                {RESULT_UI[L].bookmarkNote}
              </p>
            </>
          }
          inlineCta={
            <InlineCtaCard
              locale={L}
              content={c.paidOffers}
              calendlyUrl={calendlyUrl}
              sessionToken={token}
              category={report.category}
              categoryLabel={c.share.types[report.category].label}
            />
          }
        />
        {/* Stays where it is, deliberately. The personalised band is the most
            differentiated thing on the page for the reader who is comparing
            offers, so it belongs BEFORE the decision, not after it — moving it
            below the CTA would contradict the whole reason the type summary was
            moved to screen one. What left this block are its two outbound links:
            they were exits standing on the motivation peak, and they now sit
            below the conversion zone with the rest of the traffic-drivers. */}
        {band && (
          <aside className="mt-10 rounded-xl border border-pine/40 bg-mist/40 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-pine">
              {L === 'zh-TW' ? '你的薪資帶（估算）' : 'Your salary band (estimate)'}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed">
              {L === 'zh-TW' ? (
                <>
                  以你的組合（{band.functionLabel} × {band.expLabel}），新加坡帶約{' '}
                  <span className="font-semibold tabular-nums">{band.sgBand}</span>
                  ／年。{band.twAnchor}。名目差距約 {band.nominal}
                  {band.disposable ? `，扣掉生活成本後實際約 ${band.disposable}` : ''}。
                </>
              ) : (
                <>
                  For your combination ({band.functionLabel} × {band.expLabel}), the Singapore band is
                  roughly <span className="font-semibold tabular-nums">{band.sgBand}</span>
                  /yr. {band.twAnchor}. Nominal gap about {band.nominal}
                  {band.disposable ? `, roughly ${band.disposable} after living costs` : ''}.
                </>
              )}
            </p>
            <p className="mt-2 max-w-[30rem] text-xs text-ink-soft">
              {L === 'zh-TW'
                ? '這是市場的帶寬，不是你的定價；你的位置由證據決定。推估區間、資料截至 2026 年 7 月，以來源原始頁為準。'
                : 'This is the market band, not your price; your position is set by your evidence. Estimated ranges, data as of July 2026 — the source pages govern.'}
            </p>
          </aside>
        )}
        <PaidOfferCta
          locale={L}
          category={report.category}
          categoryLabel={c.share.types[report.category].label}
          slots={slots}
          content={c.paidOffers}
          calendlyUrl={calendlyUrl}
          sessionToken={token}
        />
        {/* The exits, all five of them, now below the decision. Measured on a
            375px phone they used to occupy 1,065px between the last line of the
            report and the conversion zone: full salary bands, cost of living, two
            MyCareersFuture postings and the weekly picks — five ways out, sitting
            exactly on the motivation peak. Nothing is lost by reading them after
            the booking CTA instead of before it.
            市場脈搏:診斷對應的當週真實市場(content/marketPulse.ts,週日管線更新;
            過期自動隱藏)。與薪資帶同一資料紀律:人工策展,絕不 LLM 生成。 */}
        <MarketPulseCard locale={L} utmContent="report" />
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <a
            href={`/${L}/salary-report?${marketUtm}`}
            className="font-medium text-pine underline-offset-2 hover:underline"
          >
            {L === 'zh-TW' ? '完整薪資帶與來源 →' : 'Full bands and sources →'}
          </a>
          <a
            href={`/${L}/cost-of-living?${marketUtm}`}
            className="font-medium text-pine underline-offset-2 hover:underline"
          >
            {L === 'zh-TW' ? '生活成本怎麼算 →' : 'How living costs change it →'}
          </a>
        </p>
        <ShareableTypeCard
          locale={L}
          category={report.category}
          content={c.share}
          shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${L}/types/${report.category}`}
          viewKey={token}
        />
        {/* Soft close: readers who won't book yet keep a zero-pressure line open. */}
        <LineActions
          title={c.flow.line.endTitle}
          body={c.flow.line.endBody}
          addLabel={c.flow.line.addCta}
          context="report_end"
        />
        {/* Twin teaser — the paid perk that turns a one-off report into a file. */}
        <p className="mt-8 max-w-[35rem] text-sm text-ink-soft">
          {c.twin.resultLink.prompt}{' '}
          <a href={`/${L}/twin`} className="font-medium text-pine underline-offset-2 hover:underline">
            {c.twin.resultLink.cta} →
          </a>
        </p>
      </main>
      {/* Mobile-only floating CTA — the report is ~15 screens; give the acting-now
          reader something to tap without scrolling to the bottom. Desktop untouched. */}
      <MobileStickyCta
        bookUrl={calendlyWithContext(calendlyUrl, { token, category: report.category })}
        callLabel={c.paidOffers.stickyCall}
        lineLabel={c.paidOffers.stickyLine}
        sessionToken={token}
      />
    </div>
  );
}
