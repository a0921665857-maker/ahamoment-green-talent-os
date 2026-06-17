import { DIMENSIONS } from '@/lib/constants';

/** Raw scores are admin-only (UX principle 6: bands for users, numbers for admin). */
export function ScoreBreakdown(props: {
  dimensionScores: Record<string, { score: number; confidence: number; evidence: string }>;
  weightedSummary: Record<string, number>;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(props.weightedSummary).map(([k, v]) => (
          <span key={k} className="rounded bg-mist px-3 py-1">
            <span className="text-ink-soft">{k}: </span>
            <span className="font-medium tabular-nums">{v.toFixed(2)}</span>
          </span>
        ))}
      </div>
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink-soft">
            <th className="py-1.5 pr-4 font-medium">Dimension</th>
            <th className="py-1.5 pr-4 font-medium">Score</th>
            <th className="py-1.5 pr-4 font-medium">Conf.</th>
            <th className="py-1.5 font-medium">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {DIMENSIONS.map((d) => {
            const row = props.dimensionScores[d];
            if (!row) return null;
            const low = row.confidence < 0.4;
            return (
              <tr key={d} className="border-b border-line/50 align-top">
                <td className="py-1.5 pr-4">{d}</td>
                <td className="py-1.5 pr-4 tabular-nums">{row.score.toFixed(1)}</td>
                <td className={`py-1.5 pr-4 tabular-nums ${low ? 'text-ink-soft' : ''}`}>
                  {row.confidence.toFixed(2)}
                  {low ? ' (excluded)' : ''}
                </td>
                <td className="py-1.5 text-ink-soft">{row.evidence}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
