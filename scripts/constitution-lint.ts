/**
 * Constitution lint, as a command.
 *
 *   npx tsx scripts/constitution-lint.ts             # every public surface
 *   npx tsx scripts/constitution-lint.ts --rule scarcity
 *   npx tsx scripts/constitution-lint.ts --include-api
 *
 * Same rules and same surfaces as tests/constitutionLint.test.ts — this is the
 * copy-editing view of them: run it while rewriting a page instead of reading a
 * test failure. Exits non-zero when anything is found, so it can be dropped into
 * a hook later without further work.
 */
import { type Finding, type RuleId, RULE_DOCS, formatFindings, lintText } from './constitution/rules';
import { allSurfaces, allowedPrices } from './constitution/surfaces';

function flag(name: string): string | boolean {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return false;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const only = flag('rule');
const includeApi = flag('include-api') === true;

const surfaces = allSurfaces({ includeApi });
const prices = allowedPrices();

let findings: Finding[] = surfaces.flatMap((s) =>
  lintText(s.path, s.text, { sellingSurface: s.selling, marketingSurface: s.marketing, allowedPrices: prices }),
);
if (typeof only === 'string') findings = findings.filter((f) => f.rule === only);

console.log(`scanned ${surfaces.length} public strings across copy modules, page source and prebuilt fragments`);
if (findings.length === 0) {
  console.log('clean — every rule in docs/UX_PRINCIPLES.md and lib/services.ts holds.');
  process.exit(0);
}

console.log(formatFindings(findings));

const counts = new Map<RuleId, number>();
for (const f of findings) counts.set(f.rule, (counts.get(f.rule) ?? 0) + 1);
console.log('\nsummary');
for (const [rule, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${rule}  (${RULE_DOCS[rule].source})`);
}
console.log(`  ${String(findings.length).padStart(3)}  total`);
process.exit(1);
