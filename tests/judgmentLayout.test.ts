import { describe, expect, it } from 'vitest';
import {
  DEPTH_0_IDS,
  EDGES,
  MAX_DEPTH,
  STATIONS,
  STRIPES,
  VIEW_H,
  VIEW_W,
  ancestorsOf,
  buildRail,
  directChildren,
  maxRailLanes,
  maxRailRows,
  outDegree,
  transitiveReach,
} from '@/lib/judgmentLayout';
import { judgmentData } from '@/lib/judgment';

/**
 * Columns the rail gutter reserves: lane 0 for the station dots plus three
 * connector lanes. Four is the true minimum, not a guess — the worst rail is
 * GC-033-WACC-FLOOR (005 → 006 → {007, 030} → 033), where three connectors are
 * live across the same row because 033 has two parents. Greedy colouring by
 * span start is optimal for intervals, so nothing narrower is reachable.
 * Raising this number means widening the gutter in JudgmentMap too.
 */
const RAIL_LANE_BUDGET = 4;

/**
 * The map's geometry is derived from the graph, so these assertions are the guard
 * that a 27th competency cannot silently break the drawing: a new depth would
 * leave a band unheaded and a wider rail would push connectors outside the
 * gutter, and both failures are invisible in a screenshot.
 */
describe('judgment map layout', () => {
  it('places every competency exactly once, inside the viewBox', () => {
    const ids = judgmentData.graph.competencies.map((c) => c.id);
    expect(STATIONS.size).toBe(ids.length);
    for (const id of ids) {
      const s = STATIONS.get(id);
      expect(s, id).toBeDefined();
      expect(s!.x).toBeGreaterThan(0);
      expect(s!.x).toBeLessThan(VIEW_W);
      expect(s!.y).toBeGreaterThan(0);
      expect(s!.y).toBeLessThan(VIEW_H);
    }
  });

  it('has a station row inside every terrain stripe', () => {
    for (const stripe of STRIPES) {
      const rows = [...STATIONS.values()].filter((s) => s.depth === stripe.depth);
      expect(rows.length, `depth ${stripe.depth}`).toBeGreaterThan(0);
      for (const s of rows) {
        expect(s.y, `${s.id} inside stripe ${stripe.depth}`).toBeGreaterThanOrEqual(stripe.y);
        expect(s.y).toBeLessThanOrEqual(stripe.y + stripe.h);
      }
    }
  });

  it('covers every depth with a stripe, and stays at four depths', () => {
    // ROWS and STRIPES are hand-specified; a new depth would draw off-canvas.
    expect(MAX_DEPTH).toBe(3);
    const depths = new Set([...STATIONS.values()].map((s) => s.depth));
    expect([...depths].sort()).toEqual(STRIPES.map((s) => s.depth).sort());
  });

  it('draws one edge per real prerequisite and no others', () => {
    const expected = judgmentData.graph.competencies.flatMap((c) =>
      c.prerequisites.filter((p) => STATIONS.has(p)).map((p) => `${p}->${c.id}`),
    );
    expect(EDGES.map((e) => `${e.from}->${e.to}`).sort()).toEqual(expected.sort());
  });

  it('every edge points from a shallower depth to a deeper one', () => {
    for (const e of EDGES) {
      const a = STATIONS.get(e.from)!;
      const b = STATIONS.get(e.to)!;
      expect(a.depth, `${e.from} -> ${e.to}`).toBeLessThan(b.depth);
      expect(a.y).toBeLessThan(b.y);
    }
  });

  it('marks exactly the edges that skip a depth', () => {
    const skips = EDGES.filter((e) => e.skipsTier);
    for (const e of skips) {
      const gap = STATIONS.get(e.to)!.depth - STATIONS.get(e.from)!.depth;
      expect(gap).toBeGreaterThan(1);
    }
    for (const e of EDGES.filter((e) => !e.skipsTier)) {
      expect(STATIONS.get(e.to)!.depth - STATIONS.get(e.from)!.depth).toBe(1);
    }
  });

  it('orders the five starting points by how much each opens up', () => {
    expect(DEPTH_0_IDS.length).toBe(5);
    const reaches = DEPTH_0_IDS.map((id) => transitiveReach(id).length);
    expect(reaches).toEqual([...reaches].sort((a, b) => b - a));
    // The four hubs plus one genuinely standalone competency.
    expect(reaches.filter((r) => r === 0).length).toBe(1);
  });

  it('flags the isolated competency and nothing else', () => {
    const isolated = [...STATIONS.values()].filter((s) => s.isolated);
    expect(isolated.length).toBe(1);
    expect(outDegree(isolated[0].id)).toBe(0);
    expect(ancestorsOf(isolated[0].id)).toEqual([]);
  });

  it('keeps every rail inside the reserved gutter and six rows', () => {
    // The gutter is sized from these. Exceeding either draws outside it.
    expect(maxRailLanes()).toBeLessThanOrEqual(RAIL_LANE_BUDGET);
    expect(maxRailRows()).toBeLessThanOrEqual(6);
  });

  it('builds a rail whose rows are exactly the route through the focus', () => {
    for (const c of judgmentData.graph.competencies) {
      const rail = buildRail(c.id);
      const expected = ancestorsOf(c.id).length + 1 + directChildren(c.id).length;
      expect(rail.rows.length, c.id).toBe(expected);
      expect(rail.rows.filter((r) => r.role === 'focus').length).toBe(1);
      // Every drawn connector is a real prerequisite edge, pointing downward.
      for (const e of rail.edges) {
        const parent = rail.rows[e.fromRow].id;
        for (const toRow of e.toRows) {
          expect(e.fromRow).toBeLessThan(toRow);
          const child = rail.rows[toRow].id;
          const realParents = judgmentData.graph.competencies.find((x) => x.id === child)!.prerequisites;
          expect(realParents, `${parent} -> ${child}`).toContain(parent);
        }
      }
      // Lane 0 belongs to the dots, so no connector may sit in it.
      for (const e of rail.edges) expect(e.lane).toBeGreaterThanOrEqual(1);
    }
  });

  it('never overlaps two connectors in the same lane and row', () => {
    for (const c of judgmentData.graph.competencies) {
      const { edges } = buildRail(c.id);
      for (let i = 0; i < edges.length; i += 1) {
        for (let j = i + 1; j < edges.length; j += 1) {
          const a = edges[i];
          const b = edges[j];
          if (a.lane !== b.lane) continue;
          const aEnd = a.toRows[a.toRows.length - 1];
          const bEnd = b.toRows[b.toRows.length - 1];
          const overlap = a.fromRow <= bEnd && b.fromRow <= aEnd;
          expect(overlap, `${c.id}: lane ${a.lane} reused across overlapping rows`).toBe(false);
        }
      }
    }
  });
});
