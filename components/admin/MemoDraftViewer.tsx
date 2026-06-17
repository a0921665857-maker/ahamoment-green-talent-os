export function MemoDraftViewer({ memo }: { memo: Record<string, unknown> | null }) {
  if (!memo) return <p className="text-sm text-ink-soft">No memo draft generated yet.</p>;
  const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  return (
    <div className="space-y-3 text-sm">
      {str(memo.read) && (
        <div>
          <p className="font-medium">Read</p>
          <p className="text-ink-soft">{str(memo.read)}</p>
        </div>
      )}
      {str(memo.gaps) && (
        <div>
          <p className="font-medium">Gaps</p>
          <p className="text-ink-soft">{str(memo.gaps)}</p>
        </div>
      )}
      {str(memo.angle) && (
        <div>
          <p className="font-medium">Angle</p>
          <p className="text-ink-soft">{str(memo.angle)}</p>
        </div>
      )}
      {arr(memo.talking_points).length > 0 && (
        <div>
          <p className="font-medium">Talking points</p>
          <ul className="list-disc pl-5 text-ink-soft">
            {arr(memo.talking_points).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {arr(memo.questions_to_ask).length > 0 && (
        <div>
          <p className="font-medium">Questions to ask</p>
          <ul className="list-disc pl-5 text-ink-soft">
            {arr(memo.questions_to_ask).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
