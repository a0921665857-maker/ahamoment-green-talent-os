import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { mbaRoiCopy } from '@/content/mbaRoi';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MbaRoiCalculator } from '@/components/MbaRoiCalculator';

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
  const t = mbaRoiCopy[locale as Locale];
  return { title: t.meta.title, description: t.meta.description };
}

export default async function MbaRoiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const t = mbaRoiCopy[L];

  const mriHref = `/${L}/mri?utm_source=mba_roi&utm_medium=on_site`;
  const salaryReportHref = `/${L}/salary-report`;

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
        <p className="mt-4 text-lg text-ink-soft">{t.lede}</p>

        <blockquote className="mt-8 border-l-2 border-pine pl-5 leading-relaxed">
          {t.scene}
          <span className="mt-3 block font-medium text-pine">{t.scenePunch}</span>
        </blockquote>

        {/* the tool itself — all maths runs in the browser */}
        <div className="mt-10">
          <MbaRoiCalculator t={t} salaryReportHref={salaryReportHref} />
        </div>

        {/* the honest caveats — part of the product, not the small print */}
        <section className="mt-12 rounded-2xl border border-line bg-mist/40 p-6 sm:p-7">
          <h2 className="text-lg font-semibold">{t.caveatsTitle}</h2>
          <ul className="mt-4 grid gap-3">
            {t.caveats.map((line, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-sm font-medium text-ink">
            {t.caveatsClose}
          </p>
        </section>

        {/* green-collar anchor — send them to real salary bands, then back here */}
        <section className="mt-10 rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold">{t.greenTitle}</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{t.greenBody}</p>
          <a
            href={salaryReportHref}
            className="mt-4 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
          >
            {t.greenLink}
          </a>
        </section>

        {/* CTA to the free MRI */}
        <section className="mt-12 rounded-2xl bg-pine px-7 py-9 text-paper">
          <p className="text-xs uppercase tracking-eyebrow text-paper/70">{t.ctaEyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">{t.ctaTitle}</h2>
          <p className="mt-3 max-w-xl text-paper/90">{t.ctaBody}</p>
          <a
            href={mriHref}
            className="mt-6 inline-block rounded-lg bg-paper px-6 py-3 font-semibold text-pine"
          >
            {t.ctaButton}
          </a>
          <p className="mt-4 text-sm text-paper/70">{t.ctaSub}</p>
        </section>
      </main>
    </div>
  );
}
