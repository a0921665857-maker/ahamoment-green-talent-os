import { depthOf, judgmentData, type JudgmentCompetency } from '@/lib/judgment';

/**
 * Geometry for the 綠領能力地圖, computed once at module scope from the graph.
 *
 * Two things here are load-bearing and neither involves measuring the DOM.
 *
 * 1. The overview is drawn inside a FIXED viewBox at `width: 100%`, so a resize
 *    is a pure CSS scale of the same paths. Nothing recomputes, no listener, no
 *    layout pass. That is what makes it impossible to reintroduce the original
 *    bug: an SVG with an intrinsic 1120px width that overflowed a 530px screen
 *    and clipped labels mid-word.
 *
 * 2. Station coordinates are DERIVED, not frozen. The winning design proposed a
 *    hand-generated coordinate table plus a CI check to catch it going stale; a
 *    barycentre sweep over 26 nodes costs microseconds, runs identically on the
 *    server and the client, and cannot go stale, so it is strictly better than a
 *    table that needs a guard.
 *
 * The overview carries no node text at all. That is the deliberate trade: 26
 * sentences of 9 to 33 Chinese characters cannot share any viewport with a
 * drawn topology, and the previous round proved that trying clips the text. So
 * the picture carries shape and the rail below it carries the words.
 */

/** viewBox units. The aspect ratio is fixed; CSS scales it. */
export const VIEW_W = 620;
export const VIEW_H = 340;
const PAD_X = 16;

/**
 * Depth 1 holds 13 of the 26 nodes. On one line that is a 45u pitch, tight
 * enough that adjacent stations touch at phone scale, so it is drawn as two
 * sub-rows. Every other depth is one row.
 */
interface RowSpec {
  depth: number;
  /** Index of this row within its depth, for splitting depth 1. */
  part: number;
  y: number;
}
const ROWS: RowSpec[] = [
  { depth: 0, part: 0, y: 34 },
  { depth: 1, part: 0, y: 108 },
  { depth: 1, part: 1, y: 156 },
  { depth: 2, part: 0, y: 232 },
  { depth: 3, part: 0, y: 304 },
];

/** Terrain stripes behind the stations, one per depth. Alternating fill, never a
 * ramp: a darkening gradient would assert that deeper means harder, and depth is
 * only a count of what has to come first. */
export const STRIPES: { depth: number; y: number; h: number }[] = [
  { depth: 0, y: 8, h: 56 },
  { depth: 1, y: 76, h: 112 },
  { depth: 2, y: 204, h: 56 },
  { depth: 3, y: 276, h: 56 },
];

export interface Station {
  id: string;
  x: number;
  y: number;
  depth: number;
  /** How many competencies name this one as a prerequisite. 0 means a terminus. */
  outDegree: number;
  financeBridge: boolean;
  /** No prerequisites and nothing depends on it: drawn apart, not as a stray dot. */
  isolated: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  /** True for the single edge that skips a depth (GC-001 → GC-041). */
  skipsTier: boolean;
}

const competencies: JudgmentCompetency[] = judgmentData.graph.competencies;
const byId = new Map(competencies.map((c) => [c.id, c]));
const familyOrder = new Map(judgmentData.graph.job_families.map((f, i) => [f.id, i]));

/** Prerequisites filtered to ids that actually exist in the graph. */
const parentsOf = new Map<string, string[]>(
  competencies.map((c) => [c.id, c.prerequisites.filter((p) => byId.has(p))]),
);

const childrenOf = new Map<string, string[]>(competencies.map((c) => [c.id, []]));
for (const c of competencies) {
  for (const p of parentsOf.get(c.id)!) childrenOf.get(p)!.push(c.id);
}

const depthOfId = new Map(competencies.map((c) => [c.id, depthOf(c.id)]));

export const MAX_DEPTH = Math.max(...depthOfId.values());

/** Everything reachable downstream. Used for "this one opens N others". */
export function transitiveReach(id: string): string[] {
  const seen = new Set<string>();
  const stack = [...(childrenOf.get(id) ?? [])];
  while (stack.length) {
    const next = stack.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...(childrenOf.get(next) ?? []));
  }
  return [...seen];
}

/** Every ancestor, not just the direct prerequisites. */
export function ancestorsOf(id: string): string[] {
  const seen = new Set<string>();
  const stack = [...(parentsOf.get(id) ?? [])];
  while (stack.length) {
    const next = stack.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...(parentsOf.get(next) ?? []));
  }
  return [...seen];
}

export function directChildren(id: string): string[] {
  return [...(childrenOf.get(id) ?? [])];
}
export function directParents(id: string): string[] {
  return [...(parentsOf.get(id) ?? [])];
}
export function outDegree(id: string): number {
  return (childrenOf.get(id) ?? []).length;
}

/**
 * Order within a row by the mean x of already-placed parents, so edges run
 * mostly straight down instead of criss-crossing. Ties break on family then id,
 * which keeps sibling topics adjacent and makes the whole layout deterministic.
 */
function buildStations(): Map<string, Station> {
  const placed = new Map<string, Station>();
  const byDepth = new Map<number, string[]>();
  for (const c of competencies) {
    const d = depthOfId.get(c.id)!;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(c.id);
  }

  const tieKey = (id: string) => {
    const c = byId.get(id)!;
    return [familyOrder.get(c.family) ?? 99, id] as const;
  };

  for (const depth of [...byDepth.keys()].sort((a, b) => a - b)) {
    const ids = byDepth.get(depth)!.slice();
    ids.sort((a, b) => {
      const ba = barycentre(a, placed);
      const bb = barycentre(b, placed);
      if (ba !== bb) return ba - bb;
      const [fa, ia] = tieKey(a);
      const [fb, ib] = tieKey(b);
      return fa - fb || ia.localeCompare(ib);
    });

    const rows = ROWS.filter((r) => r.depth === depth);
    // Split evenly, wider row first, so depth 1 becomes 7 then 6.
    const sizes = splitEvenly(ids.length, rows.length);
    let cursor = 0;
    rows.forEach((row, ri) => {
      const slice = ids.slice(cursor, cursor + sizes[ri]);
      cursor += sizes[ri];
      const pitch = (VIEW_W - PAD_X * 2) / slice.length;
      slice.forEach((id, k) => {
        const c = byId.get(id)!;
        placed.set(id, {
          id,
          x: Math.round(PAD_X + pitch * (k + 0.5)),
          y: row.y,
          depth,
          outDegree: outDegree(id),
          financeBridge: c.finance_bridge,
          isolated: parentsOf.get(id)!.length === 0 && outDegree(id) === 0,
        });
      });
    });
  }
  return placed;
}

function barycentre(id: string, placed: Map<string, Station>): number {
  const ps = parentsOf.get(id)!.map((p) => placed.get(p)?.x).filter((x): x is number => x !== undefined);
  if (ps.length === 0) return VIEW_W / 2;
  return ps.reduce((a, b) => a + b, 0) / ps.length;
}

function splitEvenly(total: number, parts: number): number[] {
  const base = Math.ceil(total / parts);
  const out: number[] = [];
  let left = total;
  for (let i = 0; i < parts; i += 1) {
    const take = i === parts - 1 ? left : Math.min(base, left);
    out.push(take);
    left -= take;
  }
  return out;
}

export const STATIONS: Map<string, Station> = buildStations();

export const EDGES: MapEdge[] = competencies.flatMap((c) =>
  parentsOf
    .get(c.id)!
    .map((p) => ({
      from: p,
      to: c.id,
      skipsTier: (depthOfId.get(c.id) ?? 0) - (depthOfId.get(p) ?? 0) !== 1,
    })),
);

export const DEPTH_0_IDS: string[] = [...STATIONS.values()]
  .filter((s) => s.depth === 0)
  .sort((a, b) => transitiveReach(b.id).length - transitiveReach(a.id).length || a.id.localeCompare(b.id))
  .map((s) => s.id);

// ---------------------------------------------------------------------------
// Route rail
// ---------------------------------------------------------------------------

export interface RailRow {
  id: string;
  /** 'up' = something you need first, 'focus', 'down' = something this opens. */
  role: 'up' | 'focus' | 'down';
}

/**
 * One bundle per parent: a single vertical run in `lane` from the parent's dot
 * down to its deepest child on the rail, with a short stub into each child.
 *
 * Bundling by parent rather than drawing one lane per edge is what keeps the
 * gutter narrow. A per-edge scheme needed six lanes, because a node with five
 * successors emits five connectors that all pass through its own row and so all
 * conflict. Bundling is also the honest shape: the lines share a trunk because
 * they share an origin, and each child hangs off it by its own stub, so nothing
 * implies an order among children that the prerequisites do not contain.
 */
export interface RailEdge {
  fromRow: number;
  /** Row indexes of this parent's children that are on the rail, ascending. */
  toRows: number[];
  lane: number;
}

export interface Rail {
  rows: RailRow[];
  edges: RailEdge[];
  lanes: number;
}

/**
 * The route through one competency: everything it needs, then it, then what it
 * opens. Rows are depth-ordered so an edge always points downward.
 *
 * Lane 0 is reserved for the station dots, so no connector ever passes through a
 * dot it does not touch — a line crossing a station would read as "this is on
 * the way", which for two unordered siblings is a relationship the data does not
 * contain. Connectors therefore start at lane 1.
 */
export function buildRail(focusId: string): Rail {
  if (!byId.has(focusId)) return { rows: [], edges: [], lanes: 1 };

  const byDepthThenId = (a: string, b: string) =>
    (depthOfId.get(a)! - depthOfId.get(b)!) || a.localeCompare(b);

  const up = ancestorsOf(focusId).sort(byDepthThenId);
  const down = directChildren(focusId).sort(byDepthThenId);

  const rows: RailRow[] = [
    ...up.map((id) => ({ id, role: 'up' as const })),
    { id: focusId, role: 'focus' as const },
    ...down.map((id) => ({ id, role: 'down' as const })),
  ];
  const indexOf = new Map(rows.map((r, i) => [r.id, i]));

  // Only real prerequisite edges, and only where both ends are on the rail,
  // grouped by the parent they leave from.
  const bundles = new Map<number, number[]>();
  for (const row of rows) {
    for (const p of parentsOf.get(row.id)!) {
      const a = indexOf.get(p);
      const b = indexOf.get(row.id);
      if (a === undefined || b === undefined || a >= b) continue;
      if (!bundles.has(a)) bundles.set(a, []);
      bundles.get(a)!.push(b);
    }
  }

  const ordered = [...bundles.entries()]
    .map(([fromRow, toRows]) => ({ fromRow, toRows: toRows.sort((x, y) => x - y) }))
    .sort((x, y) => x.fromRow - y.fromRow || x.toRows[0] - y.toRows[0]);

  // Greedy: the lowest lane free across every row this bundle's trunk spans.
  const occupied: Set<number>[] = rows.map(() => new Set<number>());
  const edges: RailEdge[] = ordered.map(({ fromRow, toRows }) => {
    const last = toRows[toRows.length - 1];
    let lane = 1;
    for (;;) {
      let free = true;
      for (let r = fromRow; r <= last; r += 1) {
        if (occupied[r].has(lane)) {
          free = false;
          break;
        }
      }
      if (free) break;
      lane += 1;
    }
    for (let r = fromRow; r <= last; r += 1) occupied[r].add(lane);
    return { fromRow, toRows, lane };
  });

  const lanes = edges.reduce((m, e) => Math.max(m, e.lane), 0) + 1;
  return { rows, edges, lanes };
}

/** Widest rail across every possible focus. Drives the gutter width, and the
 * test asserts it so a future node cannot silently overflow the channel. */
export function maxRailLanes(): number {
  return competencies.reduce((m, c) => Math.max(m, buildRail(c.id).lanes), 1);
}
export function maxRailRows(): number {
  return competencies.reduce((m, c) => Math.max(m, buildRail(c.id).rows.length), 1);
}
