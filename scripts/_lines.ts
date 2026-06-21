// throwaway: list largest source files (architecture review)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['lib', 'app', 'components', 'content', 'tests'];
const files: { f: string; n: number }[] = [];
function walk(d: string) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if ((p.endsWith('.ts') || p.endsWith('.tsx')) && !e.startsWith('_')) {
      files.push({ f: p, n: readFileSync(p, 'utf8').split('\n').length });
    }
  }
}
for (const r of roots) walk(r);
files.sort((a, b) => b.n - a.n);
for (const { f, n } of files.slice(0, 15)) console.log(`${String(n).padStart(5)}  ${f}`);
console.log(`total source files: ${files.length}`);
