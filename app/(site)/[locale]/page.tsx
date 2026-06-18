import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { REPORT_SECTION_KEYS, type Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ReturnReportLink } from '@/components/ReturnReportLink';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);
  const L = locale as Locale;
  const t = c.reportTemplates;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">{c.seo.siteName}</span>
        <div className="flex items-center gap-4">
          <ReturnReportLink locale={L} label={c.landing.hero.viewExistingReport} />
          <LanguageSwitcher current={L} />
        </div>
      </nav>

      {/* hero */}
      <header className="mx-auto max-w-3xl px-6 pb-16 pt-10">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{c.landing.hero.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{c.landing.hero.title}</h1>
        <p className="mt-4 text-base font-medium text-pine">{c.landing.hero.credibilityLine}</p>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">{c.landing.hero.subtitle}</p>

        {/* signature: the band scale glyph */}
        <div className="mt-8 flex items-end gap-1.5" aria-hidden>
          <span className="h-4 w-10 rounded-sm bg-band-emerging" />
          <span className="h-6 w-10 rounded-sm bg-band-developing" />
          <span className="h-9 w-10 rounded-sm bg-band-strong" />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`/${L}/mri`} className="rounded-lg bg-pine px-6 py-3 text-paper">
            {c.landing.hero.cta}
          </a>
          <a
            href={`/${L}/sample`}
            className="rounded-lg border border-pine px-6 py-3 text-pine"
          >
            {c.landing.hero.secondaryCta}
          </a>
        </div>
        <p className="mt-4 text-sm text-ink-soft">{c.landing.hero.timePromise}</p>
        <p className="mt-6 max-w-2xl text-sm text-ink-soft">{c.landing.hero.privacyLine}</p>
      </header>

      {/* differentiator — Blue Ocean category boundary, high on the page */}
      <section className="border-y border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-xl font-semibold">{c.landing.differentiator.title}</h2>
          <ul className="mt-5 space-y-3">
            {c.landing.differentiator.points.map((p, i) => (
              <li key={i} className="flex items-baseline gap-3 text-ink-soft">
                <span className="text-pine">—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how it works — a real 3-step sequence */}
      <section className="border-t border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-xl font-semibold">{c.landing.howItWorks.title}</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {c.landing.howItWorks.steps.map((s, i) => (
              <li key={i}>
                <span className="text-sm tabular-nums text-pine">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-1 font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* what you get — concrete section preview */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-xl font-semibold">{c.landing.whatYouGet.title}</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{c.landing.whatYouGet.intro}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {REPORT_SECTION_KEYS.map((k, i) => (
            <li key={k} className="flex items-baseline gap-3 text-sm">
              <span className="tabular-nums text-pine">{String(i + 1).padStart(2, '0')}</span>
              <span>{t.sections[k].title}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-ink-soft">{c.landing.whatYouGet.sectionPreviewNote}</p>
        <a href={`/${L}/sample`} className="mt-4 inline-block text-sm text-pine hover:underline">
          {c.sample.landingLinkLabel} →
        </a>
      </section>

      {/* founder strip */}
      <section className="border-t border-line bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-xl font-semibold">{c.landing.founder.title}</h2>
          <ul className="mt-4 space-y-2">
            {c.landing.founder.facts.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3 text-ink-soft">
                <span className="text-pine">—</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* offers — flagship services shown directly on the homepage */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-xl font-semibold">{c.landing.offersTeaser.title}</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{c.landing.offersTeaser.intro}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(['intro_call_free', 'deep_read', 'teardown_90', 'full_package'] as const).map((id) => {
            const offer = c.paidOffers.offers[id];
            return (
              <div key={id} className="flex flex-col rounded-xl border border-line bg-paper p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{offer.name}</h3>
                  <span className="shrink-0 text-sm text-pine">
                    {offer.originalPrice && (
                      <span className="mr-1 text-ink-soft line-through">{offer.originalPrice}</span>
                    )}
                    {offer.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{offer.blurb}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-6 max-w-2xl text-sm text-ink-soft">{c.paidOffers.bookingNote}</p>
        <a href={`/${L}/services`} className="mt-4 inline-block text-sm text-pine hover:underline">
          {c.landing.offersTeaser.allServicesCta} →
        </a>
        <p className="mt-6 max-w-2xl text-sm text-ink-soft">{c.landing.offersTeaser.honestUrgency}</p>
      </section>

      {/* final cta */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">{c.landing.finalCta.title}</h2>
          <p className="mt-3 text-ink-soft">{c.landing.finalCta.body}</p>
          <a href={`/${L}/mri`} className="mt-6 inline-block rounded-lg bg-pine px-6 py-3 text-paper">
            {c.landing.finalCta.cta}
          </a>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>{c.landing.footer.rightsLine}</span>
          <div className="flex items-center gap-4">
            {process.env.NEXT_PUBLIC_BLOG_URL && (
              <a
                href={process.env.NEXT_PUBLIC_BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pine"
              >
                {c.landing.footer.blogLink}
              </a>
            )}
            <a href={`/${L}/privacy`} className="hover:text-pine">
              {c.landing.footer.privacyLink}
            </a>
          </div>
        </div>
        <p className="mx-auto max-w-3xl px-6 pb-8 text-xs text-ink-soft">{c.landing.footer.deleteLine}</p>
      </footer>
    </div>
  );
}
