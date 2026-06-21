/* THROWAWAY external-review persona harness. Delete after use. */
import { callPrompt } from '@/lib/anthropic';
import { profileExtractionPrompt } from '@/lib/prompts';
import { generateReport, scoreAndClassify, applyUserEdits } from '@/lib/pipeline';
import type { Locale, InputType } from '@/lib/constants';
import type { ExtractedProfile, UserEdits } from '@/lib/types';

const MBA_RE = /\bMBA\b|admission|admissions|essay|business school|application round|why mba|adcom|b-school/i;

const SECTIONS = [
  'current_positioning',
  'core_story_gap',
  'green_career_fit',
  'mba_readiness',
  'recommended_next_move',
  'suggested_paid_next_step',
] as const;

interface Persona {
  id: string;
  desc: string;
  locale: Locale;
  inputType: InputType;
  text: string;
  edits?: UserEdits;
  expectApplicantFraming: boolean; // true => MBA framing SHOULD appear
}

const personas: Persona[] = [
  {
    id: 'P1-current-postMBA',
    desc: 'Current/grad MBA job-seeker (intent=current) — must be framed post-MBA, ZERO admissions',
    locale: 'en',
    inputType: 'cv_pdf',
    expectApplicantFraming: false,
    text: `PRIYA NAIR
INSEAD MBA Candidate (Class of Dec 2026) | Singapore | 8 yrs experience
Currently completing my MBA at INSEAD, graduating December. Recruiting now for post-MBA roles in climate investing.
EXPERIENCE
Investment Associate (pre-MBA), Aurora Climate Fund (2021-2025) — sourced and diligenced 14 climate-tech deals; led a $22M Series B into a grid-storage company; built the fund's impact-measurement framework.
Strategy Consultant, Bain SEA (2017-2021) — energy & utilities practice.
GOAL: Land a senior role at a climate-focused growth-equity fund post-graduation, within 6 months.`,
  },
  {
    id: 'P2-no-mba-transition',
    desc: 'No-MBA mid-career transition (intent=no) — ZERO MBA leakage',
    locale: 'en',
    inputType: 'linkedin_paste',
    expectApplicantFraming: false,
    text: `About: Customer Success Manager at a climate-tech SaaS (carbon accounting). 5 yrs customer-facing, last 2 in climate tech. I help mid-market firms measure Scope 1-3 and act on it. Own 30 enterprise accounts at 94% retention.
Not interested in an MBA at all — I want to go deeper on the climate side and grow into a sustainability-strategy lead role over the next 2 years. Based in Singapore.`,
  },
  {
    id: 'P3-unknown-nevermentioned',
    desc: 'Unknown MBA intent (CV never mentions MBA) — ZERO MBA leakage',
    locale: 'en',
    inputType: 'cv_pdf',
    expectApplicantFraming: false,
    text: `ALEX RIVERA — Sustainability & Operations | Singapore
Operations Manager, LogiCorp (2021-present): managed regional logistics across 4 markets; reduced fulfilment costs 9% YoY; implemented an emissions-tracking dashboard for the freight network.
Sustainability Program Manager, RetailGroup (2019-2021): ran the packaging circularity program; diverted 1,400 tonnes of waste annually; coordinated GRI reporting across 6 units.
Analyst, ConsultCo (2017-2019): ESG diligence and operational improvement.
EDUCATION: BSc Industrial Engineering, 2016. SKILLS: GRI, LCA, ops optimization, data viz.`,
  },
  {
    id: 'P4-active-applicant',
    desc: 'Active MBA applicant (intent=active) — MBA framing SHOULD appear',
    locale: 'en',
    inputType: 'cv_pdf',
    expectApplicantFraming: true,
    text: `JORDAN TAN — Carbon Markets Lead | Singapore | 7 yrs
Carbon Markets Lead, GreenRidge Capital (2022-present): led origination/diligence on a US$40m voluntary carbon portfolio across SE Asia (REDD+, cookstoves, blue carbon); built the Article 6 readiness framework; closed 6 offtake agreements totalling 1.2M tCO2e; managed 4 analysts; owned a US$3m revenue target (118%).
Senior Consultant, Deloitte SEA Sustainability (2018-2022): SBTi target-setting, Scope 1-3 for 12 listed clients; CBAM diagnostics for 2 steel makers.
GOAL: Targeting a top European MBA (INSEAD), applying this cycle R1, to move from carbon-markets execution into climate-fund investment leadership. Relocate within 18 months.`,
  },
  {
    id: 'P5-considering-later',
    desc: 'Considering/later MBA (intent considering/later) — MBA framing OK',
    locale: 'zh-TW',
    inputType: 'notes_paste',
    expectApplicantFraming: true,
    text: `我在 KPMG 台灣永續組擔任資深顧問約 6 年，做企業 ESG 報告書、SASB/GRI 導入，也帶過 SBTi 專案，客戶以上市櫃製造業為主，最近接觸 TCFD 與 CBAM。我帶 3-4 個資淺同事，但偏專案層級而非正式主管。我有點卡住，知道自己累積不少，但說不清下一步。有想過念 MBA，可能 6-12 個月內申請，但還沒決定，也不確定念完做什麼。有人說可以往氣候金融或影響力投資走，但我沒有投資實務經驗。`,
  },
  {
    id: 'P6-esg-to-sustfinance',
    desc: 'ESG consultant -> sustainable finance (no MBA) — sector nuance preserved',
    locale: 'en',
    inputType: 'notes_paste',
    expectApplicantFraming: false,
    text: `I'm an ESG consultant, 6 years at a Big-4 firm. I've led TCFD and CSRD readiness for listed financials, built two clients' green-taxonomy alignment assessments, and ran a sustainability-linked-loan KPI design project for a regional bank. I want to move OUT of advisory and INTO an in-house sustainable-finance role at a bank or asset manager — structuring green bonds / SLLs. Not doing an MBA; I'd rather make the move on the strength of my deals. Timeline ~6 months.`,
  },
  {
    id: 'P7-impact-to-climateinvesting',
    desc: 'Impact analyst -> climate investing (unknown intent) — aspiration vs achievement',
    locale: 'en',
    inputType: 'notes_paste',
    expectApplicantFraming: false,
    text: `I'm an impact analyst at a family office, 4 years in. I screen impact funds, write IC memos on social-impact managers, and track portfolio impact KPIs. I'm fascinated by climate investing and would love to move into a climate-VC or climate-PE seat, but I've never led a deal myself or sat on a board. I read everything about climate tech. How do I get there?`,
  },
  {
    id: 'P8-carbon-markets-pro',
    desc: 'Carbon-markets pro, no MBA — must not be flattened to general ESG',
    locale: 'en',
    inputType: 'linkedin_paste',
    expectApplicantFraming: false,
    text: `Senior Carbon Originator, 7 yrs in voluntary & compliance carbon markets. I structure ARR/REDD+ offtake deals, price forward contracts, and run Article 6 corresponding-adjustment due diligence. Closed $30M of forward-purchase agreements last year across 4 jurisdictions. Deep on CORSIA and the EU ETS. No MBA plans — I want to move from origination into a carbon-fund portfolio-management role.`,
  },
  {
    id: 'P9-engineer-to-climatetech',
    desc: 'Engineer -> climate tech (aspiring depth, no MBA) — bridge framing, honest gap',
    locale: 'en',
    inputType: 'cv_pdf',
    expectApplicantFraming: false,
    text: `DANIEL OKAFOR — Mechanical Engineer | 6 yrs
Senior Mechanical Engineer, AutoParts Mfg (2019-present): led thermal-systems design for EV battery packs; cut prototype cycle time 25%; hold 2 patents on cooling architecture.
Mechanical Engineer, HVAC Systems Co (2018-2019).
EDUCATION: BEng Mechanical Engineering, 2017.
I want to move into a climate-tech hardware company (batteries, grid storage, heat pumps). No climate job title yet but my EV thermal work is directly relevant. No MBA.`,
  },
  {
    id: 'P10-policy-ngo',
    desc: 'Policy/NGO climate (no MBA) — should not be pushed to commercial/MBA',
    locale: 'en',
    inputType: 'notes_paste',
    expectApplicantFraming: false,
    text: `I work in climate policy at an environmental NGO, 7 years. I led our coalition's submission on the national carbon-pricing bill, coordinated 12 member orgs, and authored a widely-cited report on just-transition for coal regions. I've testified before a parliamentary committee. I want to stay in climate but move toward a role with more direct leverage — maybe a climate think-tank director or a multilateral (UNFCCC/ADB) policy role. No MBA; not commercial.`,
  },
  {
    id: 'P11-junior-thin',
    desc: 'Junior new grad (unknown) — profile_building, seniority must be junior',
    locale: 'en',
    inputType: 'notes_paste',
    expectApplicantFraming: false,
    text: `Hi — I'm interested in climate/sustainability. I studied environmental science and graduated about a year ago. I did one internship at an NGO doing research and admin. I really care about climate change and want a meaningful career — maybe consulting or something with carbon. Not sure where to start.`,
  },
  {
    id: 'P12-senior-IC-6yr',
    desc: 'SENIORITY GUARDRAIL: ~6yr senior IC, no exec title — seniority must be <= senior',
    locale: 'en',
    inputType: 'cv_pdf',
    expectApplicantFraming: false,
    text: `MAYA SINGH — Senior Sustainability Specialist | Singapore | 6 yrs
Senior Sustainability Specialist, Manufacturing Group (2021-present): individual contributor; owned Scope 1-3 carbon accounting for the group; built the SBTi target submission; ran the annual GRI report. No direct reports.
Sustainability Specialist, Consultancy (2018-2021): ESG data and reporting.
EDUCATION: BSc Environmental Science, 2017.
Looking for my next senior IC or first team-lead role in corporate sustainability. Have not mentioned any MBA.`,
  },
  {
    id: 'P13-confirm-edit-lineage',
    desc: 'CONFIRMATION EDIT: edits contradict extraction — corrected facts must surface',
    locale: 'en',
    inputType: 'cv_pdf',
    expectApplicantFraming: false,
    text: `SAM LEE — Analyst | 5 yrs
ESG Analyst, Reporting Co (2020-present): GRI and SASB reporting support; data collection.
Junior Analyst, SmallFirm (2019-2020).
EDUCATION: BBA 2018.`,
    // User corrects: actually a carbon-markets DEAL LEAD now, with concrete deals & sectors the CV under-stated.
    edits: {
      current_role: 'Carbon Markets Origination Lead',
      current_org: 'NorthWind Carbon Partners',
      career_summary: 'closed $45M of forward-purchase carbon offtake deals across 3 jurisdictions in the last 18 months; built the Article 6 corresponding-adjustment due-diligence checklist now used team-wide',
      sectors_note: 'voluntary carbon markets, Article 6 / CORSIA, REDD+ and blue-carbon project finance',
      intent_note: 'move from origination into carbon-fund portfolio management; no MBA planned',
    },
  },
];

function gradeLeak(body: string): string[] {
  return body.split(/(?<=[.!?。！？])\s+/).filter((s) => MBA_RE.test(s)).map((s) => s.trim());
}

async function runPersona(p: Persona) {
  const out: string[] = [];
  out.push(`\n${'#'.repeat(80)}\n# ${p.id} — ${p.desc}\n# locale=${p.locale} inputType=${p.inputType} expectApplicantFraming=${p.expectApplicantFraming}`);
  let profile: ExtractedProfile;
  try {
    profile = await callPrompt(profileExtractionPrompt, { inputType: p.inputType, rawText: p.text, locale: p.locale });
  } catch (e) {
    out.push(`  EXTRACTION ERROR: ${(e as Error).message}`);
    return out.join('\n');
  }

  if (p.edits) {
    out.push(`  [pre-edit]  role=${profile.identity.current_role ?? '?'} org=${profile.identity.current_org ?? '?'} sectors=${JSON.stringify(profile.green_economy.sectors)} free_text=${JSON.stringify(profile.green_economy.free_text)}`);
    profile = applyUserEdits(profile, p.edits);
    out.push(`  [post-edit] role=${profile.identity.current_role ?? '?'} org=${profile.identity.current_org ?? '?'} free_text=${JSON.stringify(profile.green_economy.free_text)} differentiators=${JSON.stringify(profile.story_signals.differentiators)}`);
  }

  out.push(`  EXTRACT: mba_intent=${profile.intent.mba_intent} | green_depth=${profile.green_economy.depth} | seniority=${profile.identity.seniority ?? 'null'} | yrs=${profile.identity.years_experience ?? '?'} | timeline=${profile.intent.timeline} | overall_conf=${profile.confidence.overall}`);

  const scored = await scoreAndClassify(profile, []);
  out.push(`  CLASSIFY: category=${scored.classification.category} | primary=${scored.classification.primary_offer} | secondary=${scored.classification.secondary_offer ?? '-'} | degraded=${scored.degraded} | limitedData=${scored.limitedData}`);
  out.push(`  INDICES: story=${scored.summary.story_index} mba=${scored.summary.mba_index} climate=${scored.summary.climate_index} avg=${scored.summary.avg_score}`);

  const report = await generateReport(p.locale, profile, scored);
  if (report.degraded) out.push('  *** REPORT DEGRADED (template fallback) ***');

  // Full-body MBA leak scan across ALL 12 sections
  const allLeaks: string[] = [];
  for (const [k, v] of Object.entries(report.sections)) {
    for (const s of gradeLeak(v.body)) allLeaks.push(`${k}: "${s}"`);
  }
  const leakVerdict = p.expectApplicantFraming
    ? (allLeaks.length > 0 ? `MBA framing PRESENT (expected): ${allLeaks.length} hits` : 'WARNING: expected MBA framing but found NONE (over-correction?)')
    : (allLeaks.length === 0 ? 'NO MBA LEAKAGE (correct)' : `*** MBA LEAKAGE (${allLeaks.length}) ***`);
  out.push(`  MBA-SCAN: ${leakVerdict}`);
  for (const l of allLeaks) out.push(`     - ${l}`);

  for (const k of SECTIONS) {
    out.push(`  [${k}]\n    ${report.sections[k]?.body ?? '(missing)'}`);
  }
  return out.join('\n');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY missing');
    process.exit(1);
  }
  const only = process.argv.includes('--only') ? new Set(process.argv[process.argv.indexOf('--only') + 1].split(',')) : null;
  const list = only ? personas.filter((p) => only.has(p.id)) : personas;
  // Run with limited concurrency to avoid rate limits.
  const results: string[] = [];
  for (const p of list) {
    try {
      results.push(await runPersona(p));
    } catch (e) {
      results.push(`\n# ${p.id} FATAL: ${(e as Error).message}`);
    }
  }
  console.log(results.join('\n'));
  console.log(`\n${'='.repeat(80)}\nDONE: ${list.length} personas`);
}

void main();
