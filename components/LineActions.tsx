'use client';

import { phCapture } from '@/components/PostHogProvider';
import { LINE_OA_URL } from '@/lib/constants';

/**
 * LINE capture rails for the Threads in-app-browser audience (mobile audit
 * 2026-07-17): Google OAuth is blocked inside Meta webviews, and typing an
 * email on a commute is the friction that kills the material step. "Share to
 * my own LINE" is Taiwan's native bookmark — zero typing, no email
 * infrastructure needed. Events go to PostHog only (no first-party mirror).
 */
export function LineActions(props: {
  title: string;
  body?: string;
  /** Omit to hide the share-to-self button (add-only contexts). */
  saveLabel?: string;
  /** Omit to hide the add-OA button (e.g. save-only contexts). */
  addLabel?: string;
  /** Human text for the LINE share; the resolved link is appended on click. */
  shareText?: string;
  /** Path with utm params, resolved against window.location.origin on click. */
  sharePath?: string;
  /** Event property: material_step | generating | report | report_end | landing */
  context: string;
}) {
  function openShare() {
    phCapture('line_self_share_clicked', { context: props.context });
    const url = `${window.location.origin}${props.sharePath ?? ''}`;
    const text = encodeURIComponent(`${props.shareText ?? ''}\n${url}`);
    window.open(`https://line.me/R/share?text=${text}`, '_blank', 'noopener');
  }

  return (
    <div className="mt-6 rounded-lg border border-line bg-mist/30 px-5 py-4">
      <p className="text-sm font-medium">{props.title}</p>
      {props.body && <p className="mt-1 text-sm text-ink-soft">{props.body}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {props.saveLabel && props.sharePath && (
          <button
            type="button"
            onClick={openShare}
            className="rounded-lg border border-pine px-4 py-2 text-sm text-pine"
          >
            {props.saveLabel}
          </button>
        )}
        {props.addLabel && (
          <a
            href={LINE_OA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => phCapture('line_add_clicked', { context: props.context })}
            className="rounded-lg border border-line px-4 py-2 text-sm text-ink-soft hover:border-pine"
          >
            {props.addLabel}
          </a>
        )}
      </div>
    </div>
  );
}
