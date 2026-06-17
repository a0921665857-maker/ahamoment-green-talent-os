import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = getContent(locale).seo;
  return { title: seo.titles.privacy, description: seo.descriptions.privacy };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const p = c.privacyPage;
  const email = process.env.PRIVACY_CONTACT_EMAIL ?? '[privacy contact — set PRIVACY_CONTACT_EMAIL]';

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{p.title}</h1>
        <p className="mt-3 text-ink-soft">{p.intro}</p>
        <div className="mt-8 space-y-7">
          {p.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
          {p.contactLine.replace('{{email}}', email)}
        </p>
      </main>
    </div>
  );
}
