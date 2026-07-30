'use client';

import { useCallback } from 'react';
import { depthOf, type JudgmentCompetency } from '@/lib/judgment';

/**
 * 綠領能力地圖 — the competency graph as bands you scroll down, not columns you
 * scroll sideways.
 *
 * The previous version drew the same data as four side-by-side SVG columns. It
 * mapped the data's narrowest dimension (depth, 4 values) onto the scarce axis
 * (horizontal, 718px on desktop and ~530px on the founder's screen) and its
 * widest (depth 1, 13 nodes) onto the free one. The SVG therefore had an
 * intrinsic width of 1120px and overflowed by 1.6x to 2.1x, so labels were
 * clipped mid-word — 「析」, 「部碳價」, 「曲線」 — and no reader ever saw the
 * whole map at once. Transposing it does not mitigate that overflow; it makes it
 * structurally impossible, because nothing here has a fixed intrinsic width.
 *
 * Two consequences follow from dropping SVG, and both were the point:
 *
 *   - Labels wrap natively, so `name_zh` is printed whole. The old 12-character
 *     truncation was a milder form of the same disease as the clipping.
 *   - A tile is a native `<details>`, so "click reveals the detail" needs no
 *     modal, no focus trap, and no scroll restoration. The panel opens in place,
 *     inside the band the reader was already scanning.
 *
 * The 26 prerequisite edges are not drawn. Sixteen of the 26 nodes are never a
 * prerequisite for anything, so most of those curves terminated in a leaf and
 * nobody traced them. The relation is stated in words instead — the tile face
 * names the first thing you need, and the open panel lists every prerequisite as
 * a chip you can jump to. That carries the same information in a form that
 * survives a 360px viewport.
 */

export type NodeStatus = 'have' | 'maybe' | 'gap' | 'none';

/** Same left-rule vocabulary the family cards use, so `legendBody` stays true. */
const STATUS_EDGE: Record<NodeStatus, string> = {
  have: 'border-l-2 border-pine bg-sage-soft/40',
  maybe: 'border-l-2 border-dashed border-band-developing bg-mist/50',
  gap: 'border-l-2 border-dotted border-band-emerging bg-paper',
  none: 'border-l-2 border-line bg-paper',
};

export interface MapLabels {
  depthLabel: string;
  depths: [string, string, string, string];
  statuses: { have: string; maybe: string; gap: string };
  tierCount: string;
  readyNow: string;
  needFirst: string;
  prereqsMet: string;
  unlocks: string;
  prereqTitle: string;
  openCard: string;
  cartographicNote: string;
  financeTag: string;
  sustainabilityTag: string;
  drill: string;
}

function fillOne(template: string, key: string, value: string | number): string {
  return template.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
}

/**
 * `name_zh` is a full sentence ("能讀懂一份永續報告書，並指出它避而不談的東西").
 * Inline references to a prerequisite take the clause before the first comma and
 * drop the leading 能 — but never truncate, because this text wraps.
 */
function shortName(name: string): string {
  return name.split(/[，,]/)[0].replace(/^能/, '');
}

export function JudgmentMap({
  competencies,
  statusOf,
  labels,
  showStatus,
  onOpenRep,
  cardHrefFor,
}: {
  competencies: JudgmentCompetency[];
  statusOf: (id: string) => NodeStatus;
  labels: MapLabels;
  /** Status words are an inference from the self-assessment, so they stay hidden
   * until the reader has actually given one. */
  showStatus: boolean;
  onOpenRep: (repId: string) => void;
  cardHrefFor: (id: string) => string;
}) {
  const byId = new Map(competencies.map((c) => [c.id, c]));

  // How many competencies name this one as a prerequisite. Direct successors
  // only: a transitive count is a bigger number but a vaguer claim, and the
  // copy says 「接著可以學」, which is the direct relation.
  const unlockCount = new Map<string, number>();
  for (const c of competencies) {
    for (const p of c.prerequisites) {
      if (byId.has(p)) unlockCount.set(p, (unlockCount.get(p) ?? 0) + 1);
    }
  }

  const bands: JudgmentCompetency[][] = [[], [], [], []];
  for (const c of competencies) {
    const d = Math.min(depthOf(c.id), bands.length - 1);
    bands[d].push(c);
  }

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(`map-${id}`);
    if (!(el instanceof HTMLDetailsElement)) return;
    el.open = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    el.querySelector('summary')?.focus();
  }, []);

  /** The one line on the tile face that answers "what has to come first". */
  function hintFor(c: JudgmentCompetency): string {
    if (c.prerequisites.length === 0) return labels.readyNow;
    const missing = c.prerequisites.filter((p) => byId.has(p) && statusOf(p) !== 'have');
    if (showStatus && missing.length === 0) return labels.prereqsMet;
    const next = byId.get((showStatus ? missing[0] : undefined) ?? c.prerequisites[0]);
    return next ? fillOne(labels.needFirst, 'name', shortName(next.name_zh)) : labels.readyNow;
  }

  return (
    <div className="flex flex-col gap-8">
      {bands.map((band, d) => {
        if (band.length === 0) return null;
        return (
          <section key={d}>
            <h3 className="flex flex-wrap items-baseline gap-x-2.5 text-sm font-semibold text-pine">
              {labels.depths[d]}
              <span className="text-xs font-normal text-ink-soft">
                {fillOne(labels.tierCount, 'n', band.length)}
              </span>
            </h3>

            <ul
              className="mt-3 grid list-none gap-2.5 p-0"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))' }}
            >
              {band.map((c) => {
                const status = statusOf(c.id);
                const opens = unlockCount.get(c.id) ?? 0;
                const reps = c.reps ?? [];
                const prereqs = c.prerequisites.filter((p) => byId.has(p));
                return (
                  <li key={c.id} className="min-w-0">
                    <details
                      id={`map-${c.id}`}
                      className={`h-full scroll-mt-20 rounded-r-lg px-3 py-2.5 ${STATUS_EDGE[status]}`}
                    >
                      <summary className="cursor-pointer list-none">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                          <span
                            className={
                              c.finance_bridge
                                ? 'rounded bg-sage-soft px-2 py-0.5 font-medium text-pine-deep'
                                : 'rounded border border-line px-2 py-0.5'
                            }
                          >
                            {c.finance_bridge ? labels.financeTag : labels.sustainabilityTag}
                          </span>
                          {showStatus && status !== 'none' && (
                            <span>{labels.statuses[status as 'have' | 'maybe' | 'gap']}</span>
                          )}
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed">{c.name_zh}</span>
                        <span className="mt-1.5 block text-xs text-ink-soft">
                          {hintFor(c)}
                          {opens > 0 && ` · ${fillOne(labels.unlocks, 'n', opens)}`}
                        </span>
                      </summary>

                      <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                        {prereqs.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-ink-soft">{labels.prereqTitle}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {prereqs.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => jumpTo(p)}
                                  className="inline-flex min-h-11 items-center rounded border border-line px-2.5 text-xs text-pine transition-colors hover:border-pine"
                                >
                                  {shortName(byId.get(p)!.name_zh)} ↑
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {reps.map((repId, i) => (
                            <button
                              key={repId}
                              type="button"
                              onClick={() => onOpenRep(repId)}
                              className="inline-flex min-h-11 items-center rounded-lg bg-pine px-3.5 text-xs font-semibold text-paper transition-colors hover:bg-pine-deep"
                            >
                              {reps.length > 1 ? `${labels.drill}（第 ${i + 1} 題）` : labels.drill} →
                            </button>
                          ))}
                          <a
                            href={cardHrefFor(c.id)}
                            className="inline-flex min-h-11 items-center rounded-lg border border-pine/40 px-3.5 text-xs font-medium text-pine transition-colors hover:border-pine"
                          >
                            {labels.openCard} ↓
                          </a>
                        </div>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="text-xs text-ink-soft">{labels.cartographicNote}</p>
    </div>
  );
}
