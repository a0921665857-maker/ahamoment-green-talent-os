'use client';
import { useEffect, useState } from 'react';

/** Honest, named-stage progress with the signature scan line. No fake percentages. */
export function ProgressStages({ title, stages }: { title: string; stages: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => Math.min(p + 1, stages.length - 1)), 2600);
    return () => clearInterval(t);
  }, [stages.length]);

  return (
    <div className="py-16">
      <p className="text-sm uppercase tracking-eyebrow text-pine">{title}</p>
      <div className="scanline-track mt-5 mb-8" aria-hidden />
      <ul className="space-y-3">
        {stages.map((s, idx) => (
          <li
            key={s}
            className={
              idx <= i ? 'text-ink transition-colors' : 'text-line transition-colors'
            }
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
