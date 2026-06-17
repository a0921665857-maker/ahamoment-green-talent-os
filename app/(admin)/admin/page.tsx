import Link from 'next/link';
import { listLeads } from '@/lib/adminData';

export const metadata = { title: 'Admin · Leads', robots: { index: false } };
export const dynamic = 'force-dynamic';

const GRADE_CLASS: Record<string, string> = {
  A: 'bg-band-strong text-paper',
  B: 'bg-band-developing text-paper',
  C: 'bg-band-emerging text-pine-deep',
};

export default async function AdminDashboard() {
  const leads = await listLeads();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads</h1>
        <span className="text-sm text-ink-soft">{leads.length} shown · newest first, graded A→C</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-2 pr-4 font-medium">Grade</th>
              <th className="py-2 pr-4 font-medium">When</th>
              <th className="py-2 pr-4 font-medium">Name / email</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Locale</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line/60 hover:bg-mist/40">
                <td className="py-2 pr-4">
                  {l.lead_grade ? (
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${GRADE_CLASS[l.lead_grade]}`}>
                      {l.lead_grade}
                    </span>
                  ) : (
                    <span className="text-line">—</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-ink-soft">{new Date(l.created_at).toLocaleString('en-GB')}</td>
                <td className="py-2 pr-4">
                  <Link href={`/admin/lead/${l.id}`} className="text-pine hover:underline">
                    {l.name || l.email || '(no contact yet)'}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-ink-soft">{l.result_category ?? '—'}</td>
                <td className="py-2 pr-4 text-ink-soft">{l.followup_status}</td>
                <td className="py-2 pr-4 text-ink-soft">{l.locale}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-soft">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
