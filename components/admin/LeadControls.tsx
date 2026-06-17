'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FOLLOWUP_STATUSES } from '@/lib/constants';

export function LeadControls(props: {
  sessionId: string;
  followupStatus: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(props.followupStatus);
  const [notes, setNotes] = useState(props.adminNotes ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      await fetch('/api/admin/lead', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_id: props.sessionId, followup_status: status, admin_notes: notes }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this lead and all their data? This cannot be undone.')) return;
    setBusy(true);
    try {
      await fetch('/api/admin/lead', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_id: props.sessionId }),
      });
      router.push('/admin');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-line p-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="block text-ink-soft">Follow-up status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 rounded border border-line bg-paper px-3 py-2 text-sm"
          >
            {FOLLOWUP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-pine px-5 py-2 text-sm text-paper disabled:opacity-40"
        >
          Save
        </button>
        {saved && <span className="text-sm text-ink-soft">Saved.</span>}
      </div>
      <label className="mt-4 block text-sm">
        <span className="text-ink-soft">Admin notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="mt-4 rounded-lg border border-ink/30 px-4 py-2 text-sm text-ink hover:bg-mist disabled:opacity-40"
      >
        Delete lead &amp; data
      </button>
    </div>
  );
}
