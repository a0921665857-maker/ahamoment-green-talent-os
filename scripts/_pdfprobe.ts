// throwaway: TASK 1 #14 — re-run the REAL PDF through extraction (Haiku, document block)
import { readFileSync } from 'node:fs';
import { callPrompt } from '@/lib/anthropic';
import { profileExtractionPrompt } from '@/lib/prompts';
import { generateReport, scoreAndClassify } from '@/lib/pipeline';
import { REPORT_SECTION_KEYS } from '@/lib/constants';

const PDF = 'C:\\Users\\michael\\Desktop\\Resume_Angel_INSEAD26j.pdf';

(async () => {
  const buf = readFileSync(PDF);
  console.log(`PDF bytes: ${buf.length}`);
  const pdfBase64 = buf.toString('base64');

  const profile = await callPrompt(
    profileExtractionPrompt,
    { inputType: 'cv_pdf', locale: 'en' },
    { pdfBase64 },
  );
  console.log('--- EXTRACTED IDENTITY ---');
  console.log(JSON.stringify(profile.identity, null, 2));
  console.log('mba_intent:', profile.intent.mba_intent, '| timeline:', profile.intent.timeline, '| target_move:', profile.intent.target_move);
  console.log('green depth:', profile.green_economy.depth, '| sectors:', profile.green_economy.sectors, '| functions:', profile.green_economy.functions);
  console.log('confidence:', JSON.stringify(profile.confidence));
  console.log('education:', JSON.stringify(profile.education));
  console.log('credentials:', JSON.stringify(profile.credentials));
  console.log('evidence_assets count:', profile.evidence_assets.length);
  console.log('career_history:', JSON.stringify(profile.career_history.map(h => ({org:h.org, role:h.role, start:h.start, end:h.end})), null, 2));

  const scored = await scoreAndClassify(profile, []);
  console.log('--- CLASSIFICATION ---');
  console.log('category:', scored.classification.category, '| primary:', scored.classification.primary_offer, '| grade:', scored.classification.lead_grade, '| limitedData:', scored.limitedData, '| degraded:', scored.degraded);
  console.log('indices:', JSON.stringify(scored.summary));

  const report = await generateReport('en', profile, scored);
  console.log('--- REPORT (full) ---');
  for (const k of REPORT_SECTION_KEYS) {
    console.log(`\n## ${k}\n${report.sections[k]?.body ?? '(MISSING)'}\n[evidence_ref: ${report.sections[k]?.evidence_ref ?? '-'}]`);
  }
  console.log('\nreport degraded:', report.degraded);
})().catch((e) => { console.error('ERROR:', e); process.exit(1); });
