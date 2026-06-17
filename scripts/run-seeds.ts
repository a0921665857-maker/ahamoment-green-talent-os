/**
 * Phase 4 seed runner. Runs the REAL pipeline (extraction → scoring → classify →
 * report) against the 8 seed inputs and prints the result category + a sample of
 * the generated report, flagging any category mismatch vs the ROADMAP expectation.
 *
 * Requires ANTHROPIC_API_KEY in the environment. It does NOT touch Supabase — it
 * exercises the prompts + deterministic classifier end to end so Michael can read
 * real output quality (especially the zh-TW reports) before wiring up the DB.
 *
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-seeds.ts
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-seeds.ts --only 2,8
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/run-seeds.ts --full   # print full reports
 */
import { callPrompt } from '@/lib/anthropic';
import { profileExtractionPrompt } from '@/lib/prompts';
import { generateReport, scoreAndClassify } from '@/lib/pipeline';
import { REPORT_SECTION_KEYS } from '@/lib/constants';
import { seedInputs } from '@/tests/fixtures/seedInputs';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const onlyArg = arg('--only');
const full = process.argv.includes('--full');
const only = onlyArg ? new Set(onlyArg.split(',').map((s) => Number(s.trim()))) : null;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required. This script calls the real model.');
    process.exit(1);
  }

  const seeds = seedInputs.filter((s) => !only || only.has(s.id));
  let pass = 0;
  const misses: string[] = [];

  for (const seed of seeds) {
    console.log(`\n${'='.repeat(72)}\nSeed ${seed.id}: ${seed.name}  [${seed.locale} / ${seed.inputType}]`);
    try {
      const profile = await callPrompt(profileExtractionPrompt, {
        inputType: seed.inputType,
        rawText: seed.text,
        locale: seed.locale,
      });
      console.log(
        `  extracted: ${profile.identity.current_role ?? '?'} @ ${profile.identity.current_org ?? '?'} | mba_intent=${profile.intent.mba_intent} | timeline=${profile.intent.timeline} | overall_conf=${profile.confidence.overall}`,
      );

      const scored = await scoreAndClassify(profile, []);
      const expected = Array.isArray(seed.expectCategory) ? seed.expectCategory : [seed.expectCategory];
      const ok = expected.includes(scored.classification.category);
      pass += ok ? 1 : 0;
      if (!ok) misses.push(`Seed ${seed.id}: got ${scored.classification.category}, expected ${expected.join(' | ')}`);

      console.log(
        `  category: ${scored.classification.category} ${ok ? 'OK' : `MISMATCH (expected ${expected.join(' | ')})`}`,
      );
      console.log(
        `  offers: primary=${scored.classification.primary_offer} secondary=${scored.classification.secondary_offer ?? '—'} grade=${scored.classification.lead_grade} limitedData=${scored.limitedData}`,
      );
      console.log(
        `  indices: story=${scored.summary.story_index} mba=${scored.summary.mba_index} climate=${scored.summary.climate_index} avg=${scored.summary.avg_score}`,
      );

      const report = await generateReport(seed.locale, profile, scored);
      if (full) {
        for (const k of REPORT_SECTION_KEYS) {
          console.log(`\n  [${k}]\n  ${report.sections[k]?.body ?? '(missing)'}`);
        }
      } else {
        console.log(`  sample — current_positioning:\n    ${report.sections.current_positioning?.body ?? '(missing)'}`);
        console.log(`  sample — core_story_gap:\n    ${report.sections.core_story_gap?.body ?? '(missing)'}`);
      }
      if (report.degraded) console.log('  ⚠ report degraded (fell back to templates)');
    } catch (e) {
      misses.push(`Seed ${seed.id}: threw ${(e as Error).message}`);
      console.error(`  ERROR: ${(e as Error).message}`);
    }
  }

  console.log(`\n${'='.repeat(72)}\nSeeds passed category check: ${pass}/${seeds.length}`);
  if (misses.length) {
    console.log('Mismatches / errors:');
    for (const m of misses) console.log(`  - ${m}`);
  }
  console.log('\nRead the zh-TW report bodies above for tone/accuracy (Phase 4 quality gate).');
}

void main();
