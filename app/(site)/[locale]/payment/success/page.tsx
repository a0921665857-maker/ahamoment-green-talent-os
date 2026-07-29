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
  // A confirmation page must never be indexed — it is reachable only after a
  // real checkout and has no value in search results.
  return { title: paymentCopy[locale].success.title, robots: { index: false, follow: false } };
}

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const p = paymentCopy[L].success;
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? '';

  return (
    <div className="min-h-screen">
      {/* No order id, amount or email in the event — this page is reachable by
          anyone with the URL, and the payment record already lives server-side. */}
      <PageViewPing name="payment_success_viewed" props={{ locale: L }} />

      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{p.title}</h1>
        <p className="mt-3 text-ink-soft">{p.body}</p>

        <section className="mt-10 rounded-xl border border-line bg-paper p-6">
          <h2 className="text-lg font-semibold">{p.nextTitle}</h2>
          <ol className="mt-4 space-y-3">
            {p.next.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="shrink-0 font-medium text-pine tabular-nums">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
              >
                {p.bookCta}
              </a>
            )}
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg border border-pine px-5 py-2.5 text-sm text-pine"
            >
              {p.lineCta}
            </a>
          </div>
        </section>

        <p className="mt-6 text-xs text-ink-soft">{p.receiptNote}</p>

        <a href={`/${L}`} className="mt-10 inline-block text-sm text-pine underline-offset-2 hover:underline">
          {p.homeCta} →
        </a>
      </main>
    </div>
  );
}
