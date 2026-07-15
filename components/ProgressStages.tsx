'use client';
import { useEffect, useState } from 'react';

/** Honest, named-stage progress with the signature scan line. No fake percentages. */
export function ProgressStages({
  title,
  stages,
  note,
}: {
  title: string;
  stages: string[];
  note?: string;
}) {
  const [i, setI] = useState(0);
  // The last stage can run for minutes (report generation). Without a live
  // signal users read the frozen list as a crash and close the tab — the exact
  // failure a real user-tested walkthrough hit. The cycling dots keep it alive.
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setI((p) => Math.min(p + 1, stages.length - 1)), 2600);
    return () => clearInterval(t);
  }, [stages.length]);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 700);
    return () => clearInterval(t);
  }, []);
  const done = i >= stages.length - 1;

  return (
    <div className="py-16">
      <p className="text-sm uppercase tracking-eyebrow text-pine">{title}</p>
      <div className="scanline-track mt-5 mb-8" aria-hidden />
      <ul className="space-y-3">
        {stages.map((s, idx) => (
          <li
            key={idx}
            className={idx <= i ? 'text-ink transition-colors' : 'text-line transition-colors'}
          >
            {s}
            {idx === i && <span className="text-pine">{' ' + '·'.repeat(dots)}</span>}
          </li>
        ))}
      </ul>
      {note && <p className="mt-8 max-w-md text-sm text-ink-soft">{note}</p>}
    </div>
  );
}
