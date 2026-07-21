'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/constants';
import type { TwinContent } from '@/content/schema';

/** Magic-link request form. The response is constant-shaped (no enumeration),
 * so the UI always shows the same "sent if eligible" note after submit. */
export function TwinRequestForm(props: { locale: Locale; content: TwinContent['request'] }) {
  const t = props.content;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'invalid'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState('invalid');
      return;
    }
    setState('sending');
    try {
      await fetch('/api/twin/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale: props.locale }),
      });
    } catch {
      /* constant-shaped UX either way */
    }
    setState('sent');
  }

  if (state === 'sent') {
    return <p className="mt-6 max-w-xl rounded-lg border border-line bg-mist/40 px-4 py-3 text-sm text-ink">{t.sentNote}</p>;
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-xl">
      <label htmlFor="twin-email" className="block text-sm font-medium">
        {t.emailLabel}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="twin-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === 'invalid') setState('idle');
          }}
          placeholder={t.emailPlaceholder}
          className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="shrink-0 rounded-lg bg-pine px-5 py-3 text-sm text-paper disabled:opacity-60"
        >
          {t.submitCta}
        </button>
      </div>
      {state === 'invalid' && <p className="mt-2 text-sm text-band-emerging">{t.invalidEmail}</p>}
    </form>
  );
}
