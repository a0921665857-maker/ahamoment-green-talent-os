import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { alternatesFor } from '@/lib/seoAlternates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = getContent(locale).seo;
  return {
    title: seo.titles.privacy,
    description: seo.descriptions.privacy,
    alternates: alternatesFor(locale as Locale, '/privacy'),
  };
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
      <main id="main" className="mx-auto max-w-2xl px-6 pb-24 pt-6">
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
        {/* The one page whose whole job is trust had zero links inside <main>:
            the deletion-request address was plain text you had to select and
            copy. Same mailto pattern SiteFooter already uses. */}
        {/* The rule stays full-width; only the TEXT is capped. 14px inside this
            672px column ran 48 zh characters a line — the small print had the
            longest lines on the page. 35rem = 560px = 40 characters at 14px. */}
        <div className="mt-10 border-t border-line pt-6">
          <p className="max-w-[35rem] text-sm text-ink-soft">
            {(() => {
              const [before, after = ''] = p.contactLine.split('{{email}}');
              return (
                <>
                  {before}
                  <a
                    href={`mailto:${email}`}
                    className="text-pine underline-offset-2 hover:underline"
                  >
                    {email}
                  </a>
                  {after}
                </>
              );
            })()}
          </p>
        </div>
      </main>
    </div>
  );
}
