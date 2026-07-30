'use client';

import { useMemo } from 'react';
import type { JudgmentCompetency, JudgmentJobFamily } from '@/lib/judgment';

/**
 * 綠領能力地圖 — the competency graph drawn as a route, not a card wall.
 *
 * The previous presentation grouped 26 cards by topic. That answers "what
 * exists" and not the question a reader actually arrives with, which is "what
 * can I start on today, and what has to come first". The data already holds the
 * answer: 21 of the 26 competencies declare `prerequisites`, giving a real DAG
 * four layers deep with five entry points. Every position on this map is
 * computed from that field — nothing here is a design decision dressed up as
 * information.
 *
 * Columns are prerequisite depth: what you can begin with no groundwork, then
 * what needs one layer under it, and so on. Edges are the prerequisites
 * themselves. A ring marks the competencies whose `finance_bridge` flag is set,
 * because "the finance half is the part sustainability people are missing" is
 * the whole thesis of this module and it should be visible at a glance rather
 * than stated in a legend.
 *
 * Rendered as inline SVG with no dependency and no client-side layout pass, so
 * it is in the first paint and in the HTML a crawler sees. The card list below
 * it stays: this is the overview, that is the detail, and the cards remain the
 * accessible path for anyone the SVG does not serve.
 */

export type NodeStatus = 'have' | 'maybe' | 'gap' | 'none';

const COL_W = 232;
const COL_GAP = 56;
const NODE_H = 46;
const NODE_GAP = 14;
const PAD_X = 12;
const PAD_TOP = 30;

const STATUS_FILL: Record<NodeStatus, string> = {
  have: 'var(--color-sage-soft, #dde8e0)',
  maybe: 'var(--color-mist, #eef1ee)',
  gap: 'var(--color-paper, #fff)',
  none: 'var(--color-paper, #fff)',
};
const STATUS_STROKE: Record<NodeStatus, string> = {
  have: 'var(--color-pine, #1e4d3b)',
  maybe: 'var(--color-band-developing, #7ba286)',
  gap: 'var(--color-line, #d8dfd8)',
  none: 'var(--color-line, #d8dfd8)',
};
const STATUS_DASH: Record<NodeStatus, string | undefined> = {
  have: undefined,
  maybe: '5 4',
  gap: '2 3',
  none: undefined,
};

/** Prerequisite depth, memo-free because 26 nodes is nothing and the graph is acyclic. */
function computeDepths(competencies: JudgmentCompetency[]): Map<string, number> {
  const byId = new Map(competencies.map((c) => [c.id, c]));
  const depth = new Map<string, number>();
  const visit = (id: string, seen: Set<string>): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    const node = byId.get(id);
    if (!node || node.prerequisites.length === 0) {
      depth.set(id, 0);
      return 0;
    }
    // A cycle would be a data error, not a rendering case; treat the revisit as
    // depth 0 so the map still draws instead of hanging.
    if (seen.has(id)) return 0;
    const next = new Set(seen).add(id);
    const d =
      1 +
      Math.max(
        ...node.prerequisites.filter((p) => byId.has(p)).map((p) => visit(p, next)),
      );
    depth.set(id, d);
    return d;
  };
  for (const c of competencies) visit(c.id, new Set());
  return depth;
}

/**
 * A graph node has room for about a dozen characters. `name_zh` is a full
 * sentence ("能讀懂一份永續報告書，並指出它避而不談的東西"), so take the clause
 * before the first comma and drop the leading 能 — the whole map is a list of
 * things you can do, so repeating "能" 26 times spends the space on nothing.
 */
function shortLabel(name: string): string {
  const clause = name.split(/[，,]/)[0].replace(/^能/, '');
  return clause.length > 13 ? `${clause.slice(0, 12)}…` : clause;
}

export function JudgmentGraph({
  competencies,
  families,
  statusOf,
  labels,
  hrefFor,
}: {
  competencies: JudgmentCompetency[];
  families: JudgmentJobFamily[];
  statusOf: (id: string) => NodeStatus;
  labels: {
    columns: string[];
    financeRing: string;
    statuses: { have: string; maybe: string; gap: string };
    scrollHint: string;
  };
  hrefFor?: (id: string) => string;
}) {
  const layout = useMemo(() => {
    const depth = computeDepths(competencies);
    const maxDepth = Math.max(...competencies.map((c) => depth.get(c.id) ?? 0));
    const familyOrder = new Map(families.map((f, i) => [f.id, i]));

    const columns: JudgmentCompetency[][] = Array.from({ length: maxDepth + 1 }, () => []);
    for (const c of competencies) columns[depth.get(c.id) ?? 0].push(c);
    // Ordering within a column by family keeps sibling topics adjacent, which is
    // what stops the prerequisite edges from crossing into noise.
    for (const col of columns) {
      col.sort(
        (a, b) =>
          (familyOrder.get(a.family) ?? 99) - (familyOrder.get(b.family) ?? 99) ||
          a.id.localeCompare(b.id),
      );
    }

    const pos = new Map<string, { x: number; y: number; col: number }>();
    columns.forEach((col, ci) => {
      col.forEach((c, ri) => {
        pos.set(c.id, {
          x: PAD_X + ci * (COL_W + COL_GAP),
          y: PAD_TOP + ri * (NODE_H + NODE_GAP),
          col: ci,
        });
      });
    });

    const rows = Math.max(...columns.map((c) => c.length));
    return {
      columns,
      pos,
      width: PAD_X * 2 + columns.length * COL_W + (columns.length - 1) * COL_GAP,
      height: PAD_TOP + rows * (NODE_H + NODE_GAP) + 8,
    };
  }, [competencies, families]);

  const edges = competencies.flatMap((c) =>
    c.prerequisites
      .filter((p) => layout.pos.has(p))
      .map((p) => ({ from: p, to: c.id, key: `${p}->${c.id}` })),
  );

  return (
    <div>
      <p className="mb-2 text-xs text-ink-soft sm:hidden">{labels.scrollHint}</p>
      <div className="overflow-x-auto rounded-xl border border-line bg-paper">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          role="img"
          aria-label={labels.columns.join(' → ')}
          className="block"
        >
          {/* Column headings: what each layer of prerequisite depth means. */}
          {layout.columns.map((_, ci) => (
            <text
              key={ci}
              x={PAD_X + ci * (COL_W + COL_GAP)}
              y={18}
              className="fill-pine"
              style={{ fontSize: 11, letterSpacing: '0.08em' }}
            >
              {labels.columns[ci] ?? ''}
            </text>
          ))}

          {/* Edges first so nodes paint over them. */}
          <g fill="none" stroke="var(--color-line, #d8dfd8)" strokeWidth="1.5">
            {edges.map((e) => {
              const a = layout.pos.get(e.from)!;
              const b = layout.pos.get(e.to)!;
              const x1 = a.x + COL_W;
              const y1 = a.y + NODE_H / 2;
              const x2 = b.x;
              const y2 = b.y + NODE_H / 2;
              const mid = (x1 + x2) / 2;
              return (
                <path key={e.key} d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`} />
              );
            })}
          </g>

          {layout.columns.flatMap((col) =>
            col.map((c) => {
              const p = layout.pos.get(c.id)!;
              const status = statusOf(c.id);
              const label = shortLabel(c.name_zh);
              const body = (
                <>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={COL_W}
                    height={NODE_H}
                    rx={8}
                    fill={STATUS_FILL[status]}
                    stroke={STATUS_STROKE[status]}
                    strokeWidth={status === 'have' ? 2 : 1.25}
                    strokeDasharray={STATUS_DASH[status]}
                  />
                  {/* finance_bridge — the half this module exists to name. */}
                  {c.finance_bridge && (
                    <circle
                      cx={p.x + COL_W - 14}
                      cy={p.y + 14}
                      r={4.5}
                      fill="none"
                      stroke="var(--color-pine, #1e4d3b)"
                      strokeWidth={1.5}
                    />
                  )}
                  <text
                    x={p.x + 12}
                    y={p.y + NODE_H / 2 + 4}
                    className="fill-ink"
                    style={{ fontSize: 13 }}
                  >
                    {label}
                  </text>
                  <title>{c.name_zh}</title>
                </>
              );
              return hrefFor ? (
                <a key={c.id} href={hrefFor(c.id)}>
                  {body}
                </a>
              ) : (
                <g key={c.id}>{body}</g>
              );
            }),
          )}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
        {(['have', 'maybe', 'gap'] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-3 w-5 rounded"
              style={{
                background: STATUS_FILL[s],
                border: `1.5px ${s === 'gap' ? 'dotted' : s === 'maybe' ? 'dashed' : 'solid'} ${STATUS_STROKE[s]}`,
              }}
            />
            {labels.statuses[s]}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-full border-[1.5px] border-pine"
          />
          {labels.financeRing}
        </li>
      </ul>
    </div>
  );
}
