import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { jdTranslatorCopy } from '@/content/jdTranslator';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { JdTranslator } from '@/components/JdTranslator';

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
  const t = jdTranslatorCopy[locale as Locale];
  return { title: t.meta.title, description: t.meta.description };
}

export default async function JdTranslatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const t = jdTranslatorCopy[L];
  const mriHref = `/${L}/mri?utm_source=jd_translator&utm_medium=on_site`;

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

        <JdTranslator locale={L} copy={t} mriHref={mriHref} />

        <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
          {t.footNote}
        </p>

        {/* the tool exists to feed the free MRI */}
        <section className="mt-10 rounded-2xl bg-pine px-7 py-9 text-paper">
          <h2 className="text-2xl font-semibold leading-snug">{t.cta.title}</h2>
          <p className="mt-3 max-w-xl text-paper/90">{t.cta.body}</p>
          <a
            href={mriHref}
            className="mt-6 inline-block rounded-lg bg-paper px-6 py-3 font-semibold text-pine"
          >
            {t.cta.button}
          </a>
        </section>
      </main>
    </div>
  );
}
