import Link from 'next/link';
import { getLeadDetail } from '@/lib/adminData';
import { ScoreBreakdown } from '@/components/admin/ScoreBreakdown';
import { MemoDraftViewer } from '@/components/admin/MemoDraftViewer';
import { LeadControls } from '@/components/admin/LeadControls';

export const metadata = { title: 'Admin · Lead', robots: { index: false } };
export const dynamic = 'force-dynamic';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm uppercase tracking-eyebrow text-pine">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getLeadDetail(id);
  if (!d) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/admin" className="text-sm text-pine hover:underline">
          ← Back to leads
        </Link>
        <p className="mt-6 text-ink-soft">Lead not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-pine hover:underline">
        ← Back to leads
      </Link>

      <header className="mt-4">
        <h1 className="text-xl font-semibold">{d.session.name || d.session.email || '(no contact yet)'}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {d.session.email ?? 'no email'} · {d.session.locale} · {d.session.input_type ?? '—'} ·{' '}
          {new Date(d.session.created_at).toLocaleString('en-GB')} · grade {d.session.lead_grade ?? '—'} ·{' '}
          status {d.session.status}
        </p>
      </header>

      <Section title="Follow-up">
        <LeadControls
          sessionId={d.session.id}
          followupStatus={d.session.followup_status}
          adminNotes={d.session.admin_notes}
        />
      </Section>

      {d.summaryEn && (
        <Section title="Summary">
          <p className="whitespace-pre-wrap text-sm text-ink">{d.summaryEn}</p>
        </Section>
      )}

      {d.scores && (
        <Section title="Result">
          <p className="text-sm">
            <span className="text-ink-soft">Category: </span>
            {d.scores.result_category} · primary {d.scores.primary_offer}
            {d.scores.secondary_offer ? ` · secondary ${d.scores.secondary_offer}` : ''}
          </p>
        </Section>
      )}

      {d.scores && (
        <Section title="Score breakdown (admin-only)">
          <ScoreBreakdown
            dimensionScores={d.scores.dimension_scores}
            weightedSummary={d.scores.weighted_summary}
          />
        </Section>
      )}

      <Section title="Teardown memo draft">
        <MemoDraftViewer memo={d.memo} />
      </Section>

      {d.answers.length > 0 && (
        <Section title="Answers">
          <ul className="space-y-2 text-sm">
            {d.answers.map((a, i) => (
              <li key={i}>
                <span className="text-ink-soft">{a.question_id}: </span>
                {a.answer}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {d.userEdits && (
        <Section title="User edits (confirmation page)">
          <pre className="overflow-x-auto rounded bg-mist p-3 text-xs">{JSON.stringify(d.userEdits, null, 2)}</pre>
        </Section>
      )}

      {d.profile && (
        <Section title="Extracted profile">
          <pre className="overflow-x-auto rounded bg-mist p-3 text-xs">{JSON.stringify(d.profile, null, 2)}</pre>
        </Section>
      )}

      {d.source && (
        <Section title="Source material">
          <p className="text-xs text-ink-soft">
            {d.source.type} · {d.source.char_count} chars
            {d.source.purged_at ? ` · purged ${new Date(d.source.purged_at).toLocaleDateString('en-GB')}` : ''}
          </p>
          {d.source.raw_text && (
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-mist p-3 text-xs">
              {d.source.raw_text}
            </pre>
          )}
        </Section>
      )}
    </main>
  );
}
