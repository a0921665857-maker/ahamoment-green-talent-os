import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { ctaOffers } from '@/lib/scoring/resultClassifier';
import { getReportByToken, getSessionStatusByToken } from '@/lib/reportData';
import { getPersonalBand } from '@/lib/salaryBands';
import { localeRedirectPath } from '@/lib/reportView';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InlineCtaCard } from '@/components/InlineCtaCard';
import { MriLiteReport } from '@/components/MriLiteReport';
import { PaidOfferCta } from '@/components/PaidOfferCta';
import { ShareableTypeCard } from '@/components/ShareableTypeCard';
import { ReportPending } from '@/components/ReportPending';
import { LineActions } from '@/components/LineActions';
import { MobileStickyCta } from '@/components/MobileStickyCta';
import { calendlyWithContext } from '@/lib/bookingUrl';

export const dynamic = 'force-dynamic';

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
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
            <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
              {c.seo.siteName}
            </a>
            <LanguageSwitcher current={L} />
          </nav>
          <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
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
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="text-ink">{c.errors.notFound}</p>
        <a href={`/${L}/mri`} className="mt-4 inline-block text-pine hover:underline">
          {c.landing.hero.cta}
        </a>
      </div>
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
  // Direct-payment path for the one async offer (no session to schedule). Unset env = unchanged behavior.
  const deepReadPayLink = process.env.NEXT_PUBLIC_STRIPE_LINK_DEEP_READ;
  const stripeLinks = deepReadPayLink ? { deep_read: deepReadPayLink } : undefined;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-2xl px-6 pb-28 pt-6 sm:pb-24">
        {report.degraded && (
          <p className="mb-6 rounded border border-line bg-mist px-4 py-3 text-sm text-ink-soft">
            {c.errors.reportDegraded}
          </p>
        )}
        {/* Save-for-later rail before the 13-screen report: the Threads in-app
            browser has no tabs or history — LINE is the reader's way back. */}
        <div className="mb-8">
          <LineActions
            title={c.flow.line.resultTitle}
            body={c.flow.line.resultBody}
            saveLabel={c.flow.line.saveCta}
            addLabel={c.flow.line.addCta}
            shareText={c.flow.line.shareTextReport}
            sharePath={`/${L}/result/${token}?utm_source=line_self&utm_medium=save`}
            context="report"
          />
        </div>
        <MriLiteReport
          locale={L}
          name={report.name}
          sections={report.sections}
          bands={report.bands}
          limitedData={report.limitedData}
          templates={c.reportTemplates}
          dateLabel={formatDate(report.createdAt, L)}
          mbaIntent={report.mbaIntent}
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
        {/* Close the loop the report opens: the diagnosis names a lane; these blocks
            put real market numbers on it. Personalised band is a deterministic lookup
            against the human-curated salary-report dataset (lib/salaryBands.ts) — when
            the person's sectors/years don't map cleanly it hides and the generic
            pointer renders instead. Never guessed, never LLM-generated. */}
        {(() => {
          const band =
            report.profileConfidence >= 0.4
              ? getPersonalBand(report.sectors, report.yearsExperience, L)
              : null;
          const salaryHref = `/${L}/salary-report?utm_source=mri_report&utm_medium=pricing_block&utm_content=${band ? 'personal_band' : 'generic'}`;
          const colHref = `/${L}/cost-of-living?utm_source=mri_report&utm_medium=pricing_block&utm_content=${band ? 'personal_band' : 'generic'}`;
          const links = (
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <a href={salaryHref} className="font-medium text-pine underline-offset-2 hover:underline">
                {L === 'zh-TW' ? '完整薪資帶與來源 →' : 'Full bands and sources →'}
              </a>
              <a href={colHref} className="font-medium text-pine underline-offset-2 hover:underline">
                {L === 'zh-TW' ? '生活成本怎麼算 →' : 'How living costs change it →'}
              </a>
            </p>
          );
          if (!band) {
            return (
              <aside className="mt-10 rounded-xl border border-line bg-mist/30 px-5 py-4">
                <p className="text-sm font-medium">
                  {L === 'zh-TW' ? '賽道有了，接下來是價格。' : 'You have the lane. Now put a price on it.'}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {L === 'zh-TW'
                    ? '用真實的市場數據，看你的組合在台灣與新加坡各值多少，以及跨過去之後實際剩多少。'
                    : 'See what your combination pays in Taiwan versus Singapore, and what actually survives the move.'}
                </p>
                {links}
              </aside>
            );
          }
          return (
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
              <p className="mt-2 text-xs text-ink-soft">
                {L === 'zh-TW'
                  ? '這是市場的帶寬，不是你的定價；你的位置由證據決定。推估區間、資料截至 2026 年 7 月，以來源原始頁為準。'
                  : 'This is the market band, not your price; your position is set by your evidence. Estimated ranges, data as of July 2026 — the source pages govern.'}
              </p>
              {links}
            </aside>
          );
        })()}
        <PaidOfferCta
          locale={L}
          category={report.category}
          categoryLabel={c.share.types[report.category].label}
          slots={slots}
          content={c.paidOffers}
          calendlyUrl={calendlyUrl}
          sessionToken={token}
          stripeLinks={stripeLinks}
        />
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
