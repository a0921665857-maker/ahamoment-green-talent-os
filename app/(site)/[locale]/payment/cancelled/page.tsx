import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { paymentCopy } from '@/content/payment';
import { LINE_OA_URL, type Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PageViewPing } from '@/components/PageViewPing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: paymentCopy[locale].cancelled.title, robots: { index: false, follow: false } };
}

export default async function PaymentCancelledPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const p = paymentCopy[L].cancelled;

  return (
    <div className="min-h-screen">
      <PageViewPing name="payment_cancelled_viewed" props={{ locale: L }} />

      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{p.title}</h1>
        <p className="mt-4 max-w-xl text-ink-soft">{p.body}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`/${L}/services`}
            className="inline-block rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
          >
            {p.servicesCta}
          </a>
          <a
            href={LINE_OA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
          >
            {p.lineCta}
          </a>
        </div>

        <a href={`/${L}`} className="mt-10 inline-block text-sm text-pine underline-offset-2 hover:underline">
          {p.homeCta} →
        </a>
      </main>
    </div>
  );
}
