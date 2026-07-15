import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { ctaOffers } from '@/lib/scoring/resultClassifier';
import { getReportByToken, getSessionStatusByToken } from '@/lib/reportData';
import { localeRedirectPath } from '@/lib/reportView';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InlineCtaCard } from '@/components/InlineCtaCard';
import { MriLiteReport } from '@/components/MriLiteReport';
import { PaidOfferCta } from '@/components/PaidOfferCta';
import { ShareableTypeCard } from '@/components/ShareableTypeCard';
import { ReportPending } from '@/components/ReportPending';

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

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        {report.degraded && (
          <p className="mb-6 rounded border border-line bg-mist px-4 py-3 text-sm text-ink-soft">
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
          inlineCta={
            <InlineCtaCard locale={L} content={c.paidOffers} calendlyUrl={calendlyUrl} sessionToken={token} />
          }
        />
        {/* Close the loop the report opens: the diagnosis names a lane; these two
            pages put real market numbers on it. A user-tested walkthrough called
            the missing salary context "the cheque the report writes but doesn't cash". */}
        <aside className="mt-10 rounded-xl border border-line bg-mist/30 px-5 py-4">
          <p className="text-sm font-medium">
            {L === 'zh-TW' ? '賽道有了，接下來是價格。' : 'You have the lane. Now put a price on it.'}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {L === 'zh-TW'
              ? '用真實的市場數據，看你的組合在台灣與新加坡各值多少，以及跨過去之後實際剩多少。'
              : 'See what your combination pays in Taiwan versus Singapore, and what actually survives the move.'}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <a href={`/${L}/salary-report`} className="font-medium text-pine underline-offset-2 hover:underline">
              {L === 'zh-TW' ? '亞太綠領薪資報告 →' : 'APAC salary report →'}
            </a>
            <a href={`/${L}/cost-of-living`} className="font-medium text-pine underline-offset-2 hover:underline">
              {L === 'zh-TW' ? '異地生活成本 →' : 'Cost of living →'}
            </a>
          </p>
        </aside>
        <PaidOfferCta
          locale={L}
          category={report.category}
          slots={slots}
          content={c.paidOffers}
          calendlyUrl={calendlyUrl}
          sessionToken={token}
        />
        <ShareableTypeCard
          locale={L}
          category={report.category}
          content={c.share}
          shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${L}/types/${report.category}`}
        />
      </main>
    </div>
  );
}
