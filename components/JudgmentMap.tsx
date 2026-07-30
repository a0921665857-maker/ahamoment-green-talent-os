'use client';

import { useState } from 'react';
import {
  DEPTH_0_IDS,
  EDGES,
  STATIONS,
  STRIPES,
  VIEW_H,
  VIEW_W,
  buildRail,
  directParents,
  outDegree,
  transitiveReach,
  type Station,
} from '@/lib/judgmentLayout';
import type { JudgmentCompetency } from '@/lib/judgment';

/**
 * 綠領能力地圖 — a drawn overview plus a labelled route.
 *
 * Two previous attempts each solved half the problem. The original SVG drew all
 * 26 prerequisite edges but sized itself from its labels, so it had an intrinsic
 * width of 1120px, overflowed a 530px screen by 2x, and clipped node text
 * mid-word. The replacement was a responsive tile grid that fit perfectly and
 * printed every sentence whole, but with the edges deleted it was a tidy list of
 * cards, not a map: no terrain, no route, nothing to trace with a finger.
 *
 * The fix is to stop making one element carry both. Text and topology were
 * competing for the same 328px, so they are separated:
 *
 *   - The overview is a FIXED viewBox with all 26 stations and all 26 edges and
 *     no node text at all. Because its aspect ratio is fixed and it is set to
 *     `width: 100%`, a resize is a pure CSS scale of the same paths. It cannot
 *     overflow, at any width, ever — the failure mode of round one is not
 *     mitigated here, it is unreachable.
 *   - The route rail below it carries the words. Its connectors are CSS box
 *     borders where every vertical run is `top: 0; bottom: 0` and every dot and
 *     elbow is anchored 22px from its own row's top, so row height is
 *     mathematically irrelevant: CJK font swap, browser zoom and any reflow
 *     change the wrap count only, and every segment stays correct with no
 *     measurement and no JavaScript.
 *
 * Nothing anywhere calls getBoundingClientRect. That is the design, not a
 * shortcut: a measured overlay is exactly what would reintroduce a width that
 * depends on content.
 *
 * The overview is pointer-only and marked `role="img"`. Making 26 sub-44px SVG
 * targets focusable would be worse than not focusing them; the keyboard and
 * screen-reader path is the start tiles, the rail rows, and the full 26-item
 * list underneath, all of which carry the same information in text.
 */

export type NodeStatus = 'have' | 'maybe' | 'gap' | 'none';

const STATUS_EDGE: Record<NodeStatus, string> = {
  have: 'border-l-2 border-pine bg-sage-soft/40',
  maybe: 'border-l-2 border-dashed border-band-developing bg-mist/50',
  gap: 'border-l-2 border-dotted border-band-emerging bg-paper',
  none: 'border-l-2 border-line bg-paper',
};

/** Station fill in the overview. Only greens and neutrals; status is also text. */
const STATION_FILL: Record<NodeStatus, string> = {
  have: 'var(--color-pine, #1e4d3b)',
  maybe: 'var(--color-paper, #fff)',
  gap: 'var(--color-mist, #eef1ee)',
  none: 'var(--color-mist, #eef1ee)',
};

/** Rail gutter: lane 0 holds the dots, lanes 1 to 3 hold connectors. Four
 * columns is the measured minimum (see tests/judgmentLayout.test.ts). */
const LANE_PITCH = 18;
const DOT_X = 14;
const GUTTER = 80;
const DOT_Y = 22;
const laneX = (lane: number) => DOT_X + lane * LANE_PITCH;

export interface MapLabels {
  depths: [string, string, string, string];
  statuses: { have: string; maybe: string; gap: string };
  tierCount: string;
  readyNow: string;
  needFirst: string;
  prereqsMet: string;
  unlocks: string;
  openCard: string;
  cartographicNote: string;
  financeTag: string;
  sustainabilityTag: string;
  drill: string;
  /** Overview panel. */
  overviewTitle: string;
  overviewHint: string;
  legendHub: string;
  legendTerminus: string;
  legendFinance: string;
  isolatedNote: string;
  /** Start tiles. */
  startTitle: string;
  opensN: string;
  opensNone: string;
  /** Route rail. */
  routeTitle: string;
  routeCount: string;
  roleUp: string;
  roleFocus: string;
  roleDown: string;
}

function fillOne(t: string, k: string, v: string | number): string {
  return t.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
}

/** Inline references take the clause before the first comma and drop the leading
 * 能. Never truncated: this text wraps. */
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
  showStatus: boolean;
  onOpenRep: (repId: string, fromCompetencyId: string) => void;
  cardHrefFor: (id: string) => string;
}) {
  const byId = new Map(competencies.map((c) => [c.id, c]));
  // A default focus means the server already renders a complete, fully-drawn
  // route: the map is finished at first paint rather than after hydration.
  const [focus, setFocus] = useState<string>(DEPTH_0_IDS[0]);
  const rail = buildRail(focus);
  const routeIds = new Set(rail.rows.map((r) => r.id));

  const routeEdgeKeys = new Set(
    EDGES.filter((e) => routeIds.has(e.from) && routeIds.has(e.to)).map((e) => `${e.from}->${e.to}`),
  );

  const bands = [0, 1, 2, 3].map((d) =>
    competencies.filter((c) => STATIONS.get(c.id)?.depth === d),
  );

  return (
    <div className="flex flex-col gap-10">
      {/* ---------------- start tiles ---------------- */}
      <section>
        <h3 className="text-sm font-semibold text-pine">{labels.startTitle}</h3>
        <ul
          className="mt-3 grid list-none gap-2 p-0"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))' }}
        >
          {DEPTH_0_IDS.map((id) => {
            const c = byId.get(id);
            if (!c) return null;
            const reach = transitiveReach(id).length;
            const on = focus === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setFocus(id)}
                  aria-pressed={on}
                  className={`h-full w-full min-h-11 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    on ? 'border-pine bg-sage-soft/50' : 'border-line bg-paper hover:border-pine'
                  }`}
                >
                  <span className="block text-sm leading-relaxed">{c.name_zh}</span>
                  <span className="mt-1 block text-xs text-ink-soft">
                    {reach > 0 ? fillOne(labels.opensN, 'n', reach) : labels.opensNone}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- overview ---------------- */}
      <section>
        <h3 className="text-sm font-semibold text-pine">{labels.overviewTitle}</h3>
        <p className="mt-1.5 text-xs text-ink-soft">{labels.overviewHint}</p>

        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-paper">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block h-auto w-full"
            role="img"
            aria-label={labels.overviewHint}
          >
            {STRIPES.map((s) => (
              <g key={s.depth}>
                <rect
                  x={4}
                  y={s.y}
                  width={VIEW_W - 8}
                  height={s.h}
                  rx={8}
                  fill={s.depth % 2 === 0 ? 'var(--color-mist, #eef1ee)' : 'transparent'}
                  fillOpacity={s.depth % 2 === 0 ? 0.5 : 0}
                />
                <text
                  x={10}
                  y={s.y + 13}
                  style={{ fontSize: 10, letterSpacing: '0.06em' }}
                  fill="var(--color-ink-soft, #5a6b5f)"
                >
                  {labels.depths[s.depth]}
                </text>
              </g>
            ))}

            {/* Casing first, so a crossing reads as one line passing over another
                rather than two lines merging into a smudge at phone scale. */}
            {EDGES.map((e) => {
              const a = STATIONS.get(e.from)!;
              const b = STATIONS.get(e.to)!;
              const dy = (b.y - a.y) * 0.45;
              const d = `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
              const onRoute = routeEdgeKeys.has(`${e.from}->${e.to}`);
              return (
                <g key={`${e.from}->${e.to}`}>
                  <path d={d} fill="none" stroke="var(--color-paper, #fff)" strokeWidth={5} />
                  <path
                    d={d}
                    fill="none"
                    stroke={onRoute ? 'var(--color-pine, #1e4d3b)' : 'var(--color-line, #d8dfd8)'}
                    strokeWidth={onRoute ? 2.5 : 1.2}
                    strokeDasharray={e.skipsTier ? '6 4' : undefined}
                  />
                </g>
              );
            })}

            {[...STATIONS.values()].map((s) => (
              <StationMark
                key={s.id}
                s={s}
                status={statusOf(s.id)}
                onRoute={routeIds.has(s.id)}
                isFocus={s.id === focus}
                onPick={() => setFocus(s.id)}
              />
            ))}
          </svg>
        </div>

        <ul className="mt-3 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-xs text-ink-soft">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-3 rounded-full border-[1.5px] border-pine" />
            {labels.legendHub}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-2 rounded-full bg-pine" />
            {labels.legendTerminus}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-2.5 rounded-[2px] border-[1.5px] border-pine" />
            {labels.legendFinance}
          </li>
          <li>{labels.isolatedNote}</li>
        </ul>
        <p className="mt-2 text-xs text-ink-soft">{labels.cartographicNote}</p>
      </section>

      {/* ---------------- route rail ---------------- */}
      <section>
        <h3 className="flex flex-wrap items-baseline gap-x-2.5 text-sm font-semibold text-pine">
          {labels.routeTitle}
          <span className="text-xs font-normal text-ink-soft">
            {fillOne(labels.routeCount, 'n', rail.rows.length)}
          </span>
        </h3>

        <ol className="mt-3 list-none p-0">
          {rail.rows.map((row, r) => {
            const c = byId.get(row.id);
            if (!c) return null;
            const status = statusOf(row.id);
            const reps = c.reps ?? [];
            const roleLabel =
              row.role === 'up' ? labels.roleUp : row.role === 'focus' ? labels.roleFocus : labels.roleDown;
            return (
              <li
                key={row.id}
                className="grid"
                style={{ gridTemplateColumns: `${GUTTER}px minmax(0, 1fr)` }}
              >
                <div className="relative" aria-hidden>
                  {rail.edges.flatMap((e) => {
                    const last = e.toRows[e.toRows.length - 1];
                    const x = laneX(e.lane);
                    const parts = [];
                    const comesFromAbove = r > e.fromRow && r <= last;
                    const continuesBelow = r >= e.fromRow && r < last;
                    const touchesDot = r === e.fromRow || e.toRows.includes(r);
                    if (comesFromAbove) {
                      parts.push(
                        <span
                          key={`${e.lane}-${r}-in`}
                          className="absolute bg-pine"
                          style={{ left: x - 1, top: 0, height: DOT_Y, width: 2 }}
                        />,
                      );
                    }
                    if (continuesBelow) {
                      parts.push(
                        <span
                          key={`${e.lane}-${r}-out`}
                          className="absolute bg-pine"
                          style={{ left: x - 1, top: DOT_Y, bottom: 0, width: 2 }}
                        />,
                      );
                    }
                    if (touchesDot) {
                      parts.push(
                        <span
                          key={`${e.lane}-${r}-stub`}
                          className="absolute bg-pine"
                          style={{ left: DOT_X, top: DOT_Y - 1, width: x - DOT_X, height: 2 }}
                        />,
                      );
                    }
                    return parts;
                  })}
                  <span
                    className={`absolute rounded-full border-2 border-pine ${
                      row.role === 'focus' ? 'bg-pine' : 'bg-paper'
                    }`}
                    style={{
                      left: DOT_X - (row.role === 'focus' ? 8 : 5),
                      top: DOT_Y - (row.role === 'focus' ? 8 : 5),
                      width: row.role === 'focus' ? 16 : 10,
                      height: row.role === 'focus' ? 16 : 10,
                    }}
                  />
                </div>

                <div className="min-w-0 py-3">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                    <span className="font-medium text-pine">{roleLabel}</span>
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
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{c.name_zh}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {row.role !== 'focus' && (
                      <button
                        type="button"
                        onClick={() => setFocus(row.id)}
                        className="inline-flex min-h-11 items-center rounded-lg border border-pine/40 px-3 text-xs font-medium text-pine transition-colors hover:border-pine"
                      >
                        {labels.routeTitle} →
                      </button>
                    )}
                    {row.role === 'focus' &&
                      reps.map((repId, i) => (
                        <button
                          key={repId}
                          type="button"
                          onClick={() => onOpenRep(repId, c.id)}
                          className="inline-flex min-h-11 items-center rounded-lg bg-pine px-3.5 text-xs font-semibold text-paper transition-colors hover:bg-pine-deep"
                        >
                          {reps.length > 1 ? `${labels.drill}（第 ${i + 1} 題）` : labels.drill} →
                        </button>
                      ))}
                    <a
                      href={cardHrefFor(row.id)}
                      className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-xs text-pine transition-colors hover:border-pine"
                    >
                      {labels.openCard} ↓
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------------- the full 26, by depth ---------------- */}
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
                const opens = outDegree(c.id);
                const parents = directParents(c.id);
                const missing = parents.filter((p) => statusOf(p) !== 'have');
                const hint =
                  parents.length === 0
                    ? labels.readyNow
                    : showStatus && missing.length === 0
                      ? labels.prereqsMet
                      : fillOne(
                          labels.needFirst,
                          'name',
                          shortName(byId.get((showStatus ? missing[0] : undefined) ?? parents[0])?.name_zh ?? ''),
                        );
                return (
                  <li key={c.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setFocus(c.id)}
                      className={`h-full w-full rounded-r-lg px-3 py-2.5 text-left ${STATUS_EDGE[status]}`}
                    >
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
                        {hint}
                        {opens > 0 && ` · ${fillOne(labels.unlocks, 'n', opens)}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Shape carries the finance flag (18 of 26 nodes, so a colour spent on it would
 * mark nothing) and the out-degree numeral turns the 10 hubs into landmarks you
 * can find without reading a word. The 16 termini stay small solid dots.
 */
function StationMark({
  s,
  status,
  onRoute,
  isFocus,
  onPick,
}: {
  s: Station;
  status: NodeStatus;
  onRoute: boolean;
  isFocus: boolean;
  onPick: () => void;
}) {
  const isHub = s.outDegree > 0;
  const r = isHub ? 8 + Math.min(s.outDegree, 5) * 1.4 : 6;
  const stroke = onRoute ? 'var(--color-pine, #1e4d3b)' : 'var(--color-line, #d8dfd8)';
  const strokeWidth = onRoute ? 2.2 : 1.4;
  const fill = onRoute && !isHub ? 'var(--color-pine, #1e4d3b)' : STATION_FILL[status];

  return (
    <g onClick={onPick} style={{ cursor: 'pointer' }}>
      {isFocus && (
        <circle cx={s.x} cy={s.y} r={r + 6} fill="none" stroke="var(--color-pine, #1e4d3b)" strokeWidth={2} />
      )}
      {s.financeBridge ? (
        <rect
          x={s.x - r}
          y={s.y - r}
          width={r * 2}
          height={r * 2}
          rx={3}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={s.isolated ? '4 3' : undefined}
        />
      ) : (
        <circle
          cx={s.x}
          cy={s.y}
          r={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={s.isolated ? '4 3' : undefined}
        />
      )}
      {isHub && (
        <text
          x={s.x}
          y={s.y + 3.5}
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 600 }}
          fill={onRoute ? 'var(--color-paper, #fff)' : 'var(--color-ink-soft, #5a6b5f)'}
        >
          {s.outDegree}
        </text>
      )}
      {/* Generous transparent hit area, independent of the drawn radius. */}
      <rect x={s.x - 22} y={s.y - 22} width={44} height={44} fill="transparent" />
    </g>
  );
}
