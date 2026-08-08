'use client';

import { useState } from 'react';
import { phCapture } from '@/components/PostHogProvider';
import type { Locale } from '@/lib/constants';
import type { FlowContent } from '@/content/schema';

/**
 * Email capture — the audit's answer to the 78% drop: many who leave have
 * intent but no CV on hand right now. Get an email, send the link, and they
 * (and the concierge) can pick it up later. Records the lead server-side.
 *
 * IMPORTANT for anyone placing this component: the request body is
 * `{ email, locale }` and nothing else. No draft text, no file, no session.
 * It sends the person a link back to a blank `/mri`. The 2026-08 conversion
 * audit found it rendering next to a textarea with 83 characters already in
 * it, where `copy.done` ("sent — you can close this page") reads as a promise
 * that their material was saved, which it was not. On the material step it is
 * therefore mounted only while the field is empty and no file is chosen; on the
 * quick-read result there is nothing to lose, so it renders unconditionally.
 * If you ever need it beside real content, send the draft too — do not just
 * change the placement.
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
        <p role="status" className="text-sm text-ink">
          {p.copy.done}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-mist/30 px-5 py-4">
      <p className="text-sm font-medium">{p.copy.title}</p>
      <p className="mt-1 max-w-[35rem] text-sm text-ink-soft">{p.copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          // the field's only name was its placeholder, which disappears on the
          // first keystroke — same defect the material textarea carried
          aria-label={p.copy.placeholder}
          placeholder={p.copy.placeholder}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === 'error') setState('idle');
          }}
          className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-pine"
        />
        <button
          type="button"
          disabled={state === 'busy'}
          onClick={submit}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-pine px-4 py-2 text-sm text-pine disabled:opacity-40"
        >
          {p.copy.cta}
        </button>
      </div>
      {state === 'error' && (
        <p role="alert" className="mt-2 text-xs text-ink-soft">
          {p.copy.invalid}
        </p>
      )}
    </div>
  );
}
