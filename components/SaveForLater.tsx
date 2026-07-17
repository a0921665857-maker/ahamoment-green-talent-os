'use client';

import { useState } from 'react';
import { phCapture } from '@/components/PostHogProvider';
import type { Locale } from '@/lib/constants';
import type { FlowContent } from '@/content/schema';

/**
 * Email capture on the material step — the audit's answer to the 78% drop: many
 * who leave have intent but no CV on hand right now. Get an email, send the link,
 * and they (and the concierge) can pick it up later. Records the lead server-side.
 */
export function SaveForLater(p: { locale: Locale; copy: FlowContent['saveLater'] }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const valid = /.+@.+\..+/.test(email);

  async function submit() {
    if (!valid) {
      setState('error');
      return;
    }
    setState('busy');
    phCapture('save_for_later_submitted', { locale: p.locale });
    try {
      const res = await fetch('/api/mri/save-for-later', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale: p.locale }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="mt-4 rounded-lg border border-pine/40 bg-sage-soft/20 px-5 py-4">
        <p className="text-sm text-ink">{p.copy.done}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-mist/30 px-5 py-4">
      <p className="text-sm font-medium">{p.copy.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{p.copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          placeholder={p.copy.placeholder}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === 'error') setState('idle');
          }}
          className="min-w-0 flex-1 rounded border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-pine"
        />
        <button
          type="button"
          disabled={state === 'busy'}
          onClick={submit}
          className="rounded-lg border border-pine px-4 py-2 text-sm text-pine disabled:opacity-40"
        >
          {p.copy.cta}
        </button>
      </div>
      {state === 'error' && <p className="mt-2 text-xs text-ink-soft">{p.copy.invalid}</p>}
    </div>
  );
}
