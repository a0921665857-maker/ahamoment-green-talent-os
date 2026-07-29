import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/lib/constants';
import { navCopy } from '@/content/nav';

/**
 * Walks the route tree and collects every static path under the site group, so
 * a link in the header or footer that points at a page nobody built fails here
 * instead of 404-ing in front of a reader. Dynamic segments are excluded — the
 * nav never links into one.
 */
function staticRoutes(): Set<string> {
  const root = join(process.cwd(), 'app', '(site)', '[locale]');
  const found = new Set<string>();
  function walk(dir: string, prefix: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry.startsWith('[')) continue; // dynamic segment
        walk(full, `${prefix}/${entry}`);
      } else if (entry === 'page.tsx') {
        found.add(prefix === '' ? '/' : prefix);
      }
    }
  }
  walk(root, '');
  return found;
}

describe('site navigation', () => {
  const routes = staticRoutes();

  it('found the route tree at all', () => {
    expect(routes.size).toBeGreaterThan(8);
    expect(routes.has('/services')).toBe(true);
  });

  for (const locale of LOCALES) {
    describe(locale, () => {
      const n = navCopy[locale];

      it('every header door points at a page that exists', () => {
        for (const d of n.doors) {
          expect(routes.has(d.href), `${locale} header → ${d.href}`).toBe(true);
          expect(d.label.length).toBeGreaterThan(0);
          expect(d.hint.length).toBeGreaterThan(0);
        }
      });

      it('every footer link points at a page that exists', () => {
        for (const g of n.footerGroups) {
          expect(g.links.length).toBeGreaterThan(0);
          for (const l of g.links) {
            expect(routes.has(l.href), `${locale} footer → ${l.href}`).toBe(true);
          }
        }
      });

      it('has no duplicate footer links', () => {
        const hrefs = n.footerGroups.flatMap((g) => g.links.map((l) => l.href));
        expect(new Set(hrefs).size).toBe(hrefs.length);
      });

      it('never emits an empty or hash-only href', () => {
        const all = [...n.doors.map((d) => d.href), ...n.footerGroups.flatMap((g) => g.links.map((l) => l.href))];
        for (const href of all) {
          expect(href.startsWith('/')).toBe(true);
          expect(href).not.toBe('#');
        }
      });
    });
  }

  it('surfaces the same route set in both locales', () => {
    const hrefs = (l: (typeof LOCALES)[number]) =>
      new Set([
        ...navCopy[l].doors.map((d) => d.href),
        ...navCopy[l].footerGroups.flatMap((g) => g.links.map((x) => x.href)),
      ]);
    expect([...hrefs('en')].sort()).toEqual([...hrefs('zh-TW')].sort());
  });
});
