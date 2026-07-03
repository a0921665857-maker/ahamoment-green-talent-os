'use client';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/constants';

/** Shows a quiet "view your previous report" link if a token is in localStorage. */
export function ReturnReportLink({ locale, label }: { locale: Locale; label: string }) {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    try {
      // localStorage is client-only; reading it in an effect (not during render) is the
      // SSR-safe pattern — server + first client paint render null, then we fill in.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(localStorage.getItem('gtos_report_token'));
    } catch {
      /* ignore */
    }
  }, []);
  if (!token) return null;
  return (
    <a href={`/${locale}/result/${token}`} className="text-sm text-pine hover:underline">
      {label}
    </a>
  );
}
