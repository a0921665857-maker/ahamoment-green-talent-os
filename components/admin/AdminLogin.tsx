'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Incorrect password.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
        placeholder="Password"
      />
      {error && <p className="mt-2 text-sm text-ink">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={busy || !password}
        className="mt-4 w-full rounded-lg bg-pine px-5 py-2.5 text-sm text-paper disabled:opacity-40"
      >
        Sign in
      </button>
    </div>
  );
}
