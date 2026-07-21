import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { verifyTwinToken } from '@/lib/twinAuth';
import { getTwinReports } from '@/lib/twinData';
import { recordEvent } from '@/lib/events';
import { compareBands, type BandDelta } from '@/lib/scoring/compareBands';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getContent(locale).twin.hub.title, robots: { index: false } };
}

function dateLabel(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export default async function TwinHubPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const t = c.twin.hub;
  const bandLabels = c.reportTemplates.bandLabels;

  const email = await verifyTwinToken(token);
  if (!email) {
    return (
      <div className="min-h-screen">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
            {c.seo.siteName}
          </a>
          <LanguageSwitcher current={L} />
        </nav>
        <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
          <h1 className="text-3xl font-semibold">{t.expiredTitle}</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">{t.expiredBody}</p>
          <a
            href={`/${L}/twin`}
            className="mt-6 inline-block rounded-lg bg-pine px-6 py-3 text-sm text-paper"
          >
            {t.requestAgainCta}
          </a>
        </main>
      </div>
    );
  }

  const reports = await getTwinReports(email);
  await recordEvent('twin_viewed', null, { reports: reports.length });
  const newestFirst = [...reports].reverse();
  const deltas: BandDelta[] | null =
    reports.length >= 2
      ? compareBands(reports[reports.length - 2].bands, reports[reports.length - 1].bands)
      : null;
  const sameCount = deltas ? deltas.filter((d) => d.direction === 'same').length : 0;
  const moved = deltas ? deltas.filter((d) => d.direction === 'up' || d.direction === 'down') : [];
  const unknown = deltas ? deltas.filter((d) => d.direction === 'unknown') : [];

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">{t.intro}</p>

        {deltas ? (
          <section className="mt-10 rounded-xl border border-line bg-paper p-6">
            <h2 className="text-xl font-semibold">{t.diffTitle}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t.diffIntro}</p>
            <ul className="mt-4 space-y-2">
              {moved.map((d) => (
                <li key={d.key} className="flex items-baseline justify-between gap-4 text-sm">
                  <span>{c.twin.bandNames[d.key]}</span>
                  <span className={d.direction === 'up' ? 'font-medium text-band-strong' : 'font-medium text-band-emerging'}>
                    {d.from ? bandLabels[d.from] : t.unknownWord} → {d.to ? bandLabels[d.to] : t.unknownWord}
                    {'　'}
                    {d.direction === 'up' ? `↑ ${t.upWord}` : `↓ ${t.downWord}`}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-soft">
              {t.sameSummary.replace('{n}', String(sameCount))}
              {unknown.length > 0 ? `　·　${t.unknownWord} ×${unknown.length}` : ''}
            </p>
          </section>
        ) : (
          <p className="mt-10 max-w-2xl rounded-lg border border-line bg-mist/40 px-4 py-3 text-sm text-ink">
            {t.needTwo}
          </p>
        )}

        <section className="mt-10">
          <ul className="divide-y divide-line">
            {newestFirst.map((r, i) => (
              <li key={r.token} className="flex items-baseline justify-between gap-4 py-4">
                <div>
                  <p className="text-sm text-ink-soft">
                    {dateLabel(r.createdAt, L)}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-sage-soft/60 px-2 py-0.5 text-xs text-pine">
                        {t.latestLabel}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 font-medium">{c.share.types[r.category].label}</p>
                </div>
                <a
                  href={`/${r.locale}/result/${r.token}`}
                  className="shrink-0 text-sm text-pine underline-offset-2 hover:underline"
                >
                  {t.reportCta} →
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-xl border-2 border-pine bg-sage-soft/30 p-6">
          <h2 className="text-lg font-semibold">{t.updateTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink">{t.updateBody}</p>
          <a
            href={`/${L}/mri`}
            className="mt-4 inline-block rounded-lg bg-pine px-6 py-3 text-sm text-paper"
          >
            {t.updateCta}
          </a>
        </section>
      </main>
    </div>
  );
}
