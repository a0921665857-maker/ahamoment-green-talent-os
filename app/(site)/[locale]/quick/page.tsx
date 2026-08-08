import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { alternatesFor } from '@/lib/seoAlternates';
import { QuickReadRoute } from './QuickReadRoute';
import { parseQuickSearchParams } from './params';

/**
 * `/[locale]/quick` — the 60-second quick read on an address of its own.
 *
 * This route exists to be linked *to from off-site*: a LINE broadcast, a
 * Threads post, a reply in someone else's thread. Those readers arrive with no
 * materials to hand and no intention of pasting a CV into a stranger's site, so
 * sending them at `/mri` spends the click on a page whose first ask is the one
 * 80% of readers refuse. Here the first ask is a tap, and the whole thing is
 * over in five of them.
 *
 * Two things it deliberately is **not**:
 *
 *   - It is **not** the mobile default for `/mri`. The quick read collects no
 *     email, and the email left at the full flow's gate is the only reachable
 *     list this business has. Making it the default door would trade the list
 *     for a completion rate.
 *   - It does **not** cost Michael any time. Nothing here is written by him,
 *     scheduled with him, or waiting on him — `mapQuick` is deterministic and
 *     the salary numbers come from the drift-guarded dataset, so the page can
 *     be broadcast to a thousand people on a night he is asleep.
 *
 * See `docs/quick-route.md` for how it is meant to be used off-site.
 */

/**
 * Page-level SEO copy, kept local.
 *
 * `SeoContent.titles` / `.descriptions` in `content/schema.ts` are a closed set
 * of four keys (home, mri, privacy, result) and this route is not one of them.
 * Rather than reach into another agent's file mid-flight, these follow the
 * precedent already set by `QUICK_UI` in `components/QuickRead.tsx` and `COPY`
 * in `components/LatestContent.tsx`: self-contained surface copy lives with the
 * surface. Move them into the schema the next time the content contract is
 * opened — noted in `docs/quick-route.md`.
 *
 * Both are written, not translated (principle 10), and neither makes a claim
 * the page does not keep: no email is required to see the card, and the numbers
 * on it are ranges from the salary dataset, not a promise.
 */
const QUICK_SEO: Record<Locale, { title: string; description: string }> = {
  'zh-TW': {
    title: '60 秒綠色職涯速讀｜五題全部用點的',
    description:
      '五題全部用手指點，不用貼履歷，也不用留 email 就看得到結果。60 秒拿到一張速讀卡：你是哪一型、市場最常怎麼誤讀你、你這段年資與賽道的真實行情區間。想要讀你本人經歷的完整判讀，再接免費綠色職涯 MRI。',
  },
  en: {
    title: '60-second green-career quick read',
    description:
      'Five questions, all tapped. Nothing to paste, and no email needed to see the result. About a minute later you have a card: which type you read as, how the market most often misreads you, and the real range for your years and sector. The full free MRI is one step on from there.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const L = locale as Locale;
  return {
    title: QUICK_SEO[L].title,
    description: QUICK_SEO[L].description,
    // Canonical is the clean route on purpose: a shared card carries five
    // answers in its query string, and every combination of them would
    // otherwise look to a crawler like a separate thin page.
    alternates: alternatesFor(L, '/quick'),
  };
}

export default async function QuickPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);

  // Parsed here rather than in the browser so a shared card is in the HTML
  // document: no flash of the question list before the result appears, and a
  // link preview or a crawler sees the real page.
  const initial = parseQuickSearchParams(await searchParams, c.flow.quick);

  return (
    <div className="min-h-screen">
      <main id="main" className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <QuickReadRoute locale={L} flow={c.flow} share={c.share} initial={initial} />
      </main>
    </div>
  );
}
