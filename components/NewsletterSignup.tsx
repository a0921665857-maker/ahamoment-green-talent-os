'use client';

import { useState } from 'react';
import type { NewsletterCopy } from '@/content/newsletter';
import type { Locale } from '@/lib/constants';
import { phCapture } from '@/components/PostHogProvider';

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Temporarily hidden. The self-hosted Supabase capture never came up cleanly
// (PostgREST schema cache), and there is no send / unsubscribe yet — so the box
// would promise a newsletter we can't deliver. Re-enable once subscribe points
// at the Ghost newsletter (native capture + send + unsubscribe).
const NEWSLETTER_ENABLED = false;

/**
 * Newsletter (《綠領情報》週刊) email capture. Posts to /api/newsletter/subscribe.
 */
export function NewsletterSignup({
  locale,
  copy,
  source,
}: {
  locale: Locale;
  copy: NewsletterCopy;
  source: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const emailValid = /.+@.+\..+/.test(email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) {
      setStatus('error');
      setMessage(copy.errorInvalid);
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale, source }),
      });
      if (!res.ok) {
        setStatus('error');
        setMessage(res.status === 400 ? copy.errorInvalid : copy.errorGeneric);
        return;
      }
      setStatus('success');
      setMessage(copy.success);
      phCapture('newsletter_subscribed', { locale, source });
    } catch {
      setStatus('error');
      setMessage(copy.errorGeneric);
    }
  }

  if (!NEWSLETTER_ENABLED) return null;

  return (
    <div className="rounded-2xl border border-line bg-mist/40 px-6 py-6">
      <p className="text-xs uppercase tracking-eyebrow text-pine">{copy.eyebrow}</p>
      <p className="mt-2 max-w-xl text-base font-medium">{copy.title}</p>

      {status === 'success' ? (
        <p className="mt-4 text-sm font-medium text-pine">{copy.success}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">
            {copy.placeholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.placeholder}
            className="w-full flex-1 rounded-lg border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-pine focus:ring-2 focus:ring-pine/30"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="shrink-0 rounded-lg bg-pine px-6 py-3 font-semibold text-paper disabled:opacity-60"
          >
            {status === 'submitting' ? copy.submitting : copy.button}
          </button>
        </form>
      )}

      {status === 'error' && <p className="mt-2 text-sm text-red-600">{message}</p>}
      <p className="mt-3 text-xs text-ink-soft">{copy.privacy}</p>
    </div>
  );
}
