'use client';
import { usePathname, useRouter } from 'next/navigation';
import { localeRegistry } from '@/content/locales';
import { LOCALES, type Locale } from '@/lib/constants';

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === current) return;
    // Browser API write inside an event handler (not a render-time module mutation) —
    // the new react-hooks/immutability rule misfires on document.cookie assignment.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `gtos_locale=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    const rest = pathname.replace(new RegExp(`^/(${LOCALES.join('|')})`), '');
    // usePathname() drops the query and the hash, so switching language used to
    // strip utm attribution and dump an anchored reader back to the top of the
    // page. The existing values are carried through verbatim, never rewritten.
    const suffix = window.location.search + window.location.hash;
    router.push(`/${next}${rest || ''}${suffix}`);
  }

  return (
    <div className="inline-flex items-center gap-1 text-sm" role="group" aria-label="Language">
      {localeRegistry.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {/* the separator was text-line on paper = 1.26:1, i.e. invisible, so the
              two languages read as one run of text instead of a choice */}
          {i > 0 && (
            <span className="text-ink-soft" aria-hidden="true">
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => switchTo(l.code)}
            aria-current={l.code === current}
            // whitespace-nowrap: at 375px 繁體中文 needs 56px in a 50px box and CJK
            // breaks between any two characters, so the site's own language name
            // wrapped to 繁體中 / 文 in the header on every mobile page.
            className={
              l.code === current
                ? 'whitespace-nowrap text-ink font-medium'
                : 'whitespace-nowrap text-ink-soft hover:text-pine transition-colors'
            }
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
