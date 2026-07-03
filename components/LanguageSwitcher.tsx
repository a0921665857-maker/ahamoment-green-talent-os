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
    router.push(`/${next}${rest || ''}`);
  }

  return (
    <div className="inline-flex items-center gap-1 text-sm" role="group" aria-label="Language">
      {localeRegistry.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-line">/</span>}
          <button
            type="button"
            onClick={() => switchTo(l.code)}
            aria-current={l.code === current}
            className={
              l.code === current
                ? 'text-ink font-medium'
                : 'text-ink-soft hover:text-pine transition-colors'
            }
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
