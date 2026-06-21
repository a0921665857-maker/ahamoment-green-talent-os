// throwaway: TASK 2 — 16 persona regression through the REAL pipeline (no DB).
import { callPrompt } from '@/lib/anthropic';
import { profileExtractionPrompt } from '@/lib/prompts';
import { generateReport, scoreAndClassify } from '@/lib/pipeline';
import type { Locale } from '@/lib/constants';

interface P { id: number; name: string; locale: Locale; text: string; }

const personas: P[] = [
  { id: 1, name: 'Current/graduated MBA seeking post-MBA green job', locale: 'en', text:
`Wei Chen — Singapore. INSEAD MBA Class of 2025 (graduating in 6 months). Before the MBA: 7 years at Schneider Electric in energy-efficiency solutions, last role Regional Sustainability Solutions Manager (APAC), led a 6-person team, owned a $4M solutions P&L, cut client energy use ~18% across 40 buildings. I'm now looking for a post-MBA role leading sustainability or energy-transition strategy at a corporate or a climate-focused fund. Fluent English & Mandarin. Not applying to any MBA — I'm already in one.` },

  { id: 2, name: 'No MBA intent, wants green transition', locale: 'en', text:
`Maria Santos, Lisbon. 9 years in supply-chain operations at a consumer-goods company, Senior Operations Manager. I manage logistics for 12 distribution centres and have started leading our packaging-waste-reduction and scope-3 supplier program. I want to move fully into corporate sustainability / climate operations. I am NOT interested in doing an MBA — I want to transition through my operations experience and maybe a certificate. Timeline: within a year.` },

  { id: 3, name: 'Aspiring-to-green software engineer, zero climate exp', locale: 'en', text:
`Daniel Kim, Berlin. Senior Software Engineer, 8 years at a fintech building backend payment systems (Go, Kubernetes, distributed systems). I have NO climate or sustainability work experience at all. I care a lot about climate and want to move into climate tech — maybe carbon accounting platforms, grid software, or climate data. I don't know where I'd fit. No MBA plans. Looking to switch in the next 6-12 months.` },

  { id: 4, name: 'Active MBA applicant', locale: 'en', text:
`Priya Nair, Mumbai. 5 years at a renewable-energy developer as a Project Finance Analyst — built financial models for 300MW of solar/wind, supported $200M in debt raising. I am actively applying to top MBA programs (INSEAD, LBS, Wharton) for next year's intake to pivot into climate-focused private equity. I'm writing my essays now and need my story to be sharp. Round 2 deadlines in ~3 months.` },

  { id: 5, name: 'Big-4 ESG consultant -> sustainable finance', locale: 'en', text:
`Tom Becker, London. Manager, ESG & Climate Risk at a Big Four firm, 6 years total. I advise banks and asset managers on TCFD/ISSB disclosure, climate scenario analysis, and portfolio decarbonization. I want to move INTO sustainable finance / responsible investment at an asset manager — a buy-side ESG integration or stewardship role. Considering whether an MBA would help but leaning no. Timeline 6-12 months.` },

  { id: 6, name: 'Impact-investment analyst -> climate investing', locale: 'en', text:
`Sofia Rossi, Amsterdam. Investment Analyst at an impact-investment fund (4 years), focused on financial inclusion and SME debt in emerging markets. I source, run due diligence, and build models for impact deals; I sit on 2 portfolio company boards as observer. I want to move specifically into CLIMATE investing — climate VC or a climate-focused growth equity fund. No MBA planned for now. Timeline ~12 months.` },

  { id: 7, name: 'Corporate sustainability/reporting manager -> climate strategy', locale: 'en', text:
`James O'Brien, Dublin. Corporate Sustainability Manager at a FTSE-250 manufacturer, 7 years. I own our CSRD/ESRS reporting, the annual sustainability report, CDP submission, and SBTi target setting. I want to move from reporting/compliance into climate STRATEGY — shaping the decarbonization roadmap and influencing capex, not just disclosing it. Unsure about MBA. Timeline within a year.` },

  { id: 8, name: 'Carbon-markets pro (Article 6 / CORSIA / ratings)', locale: 'en', text:
`Amara Okafor, Nairobi/London. 5 years in carbon markets. Currently Senior Carbon Markets Analyst at a ratings/advisory firm: I assess carbon credit project quality, work on Article 6.2/6.4 bilateral deals, CORSIA-eligible units, and integrity ratings (à la BeZero/Sylvera). I want to grow into a lead role shaping methodologies or heading origination at a carbon project developer or fund. No MBA intent. Timeline 6 months.` },

  { id: 9, name: 'Engineer -> climate tech', locale: 'en', text:
`Lukas Weber, Munich. Mechanical Engineer, 10 years in automotive powertrain R&D at an OEM. Strong in thermal systems, simulation, and product development; led a 12-engineer team. I want to move into climate tech hardware — batteries, heat pumps, hydrogen, or industrial decarbonization. Some adjacency (EV powertrain) but no pure-play climate company experience. No MBA. Timeline 6-12 months.` },

  { id: 10, name: 'Policy/NGO -> private green job', locale: 'en', text:
`Fatima Al-Rashid, Washington DC. 8 years in climate policy: 4 at a climate NGO (advocacy, coalition building on clean-energy policy), 4 at a government agency working on energy regulation. I want to move from policy/advocacy into the PRIVATE sector — a corporate climate-policy/government-affairs role or a climate-tech policy/market role. No MBA. Timeline within 12 months.` },

  { id: 11, name: 'Junior (0-2 yrs) entry green', locale: 'en', text:
`Noah Williams, Toronto. 1.5 years experience. Sustainability Coordinator at a mid-size real-estate company — I track building energy data, support LEED certifications, and help with the annual GRESB submission. Bachelor's in Environmental Science. I want to grow into a real sustainability/ESG analyst or consultant role. No MBA yet (too junior). Timeline flexible, ~12 months.` },

  { id: 12, name: 'Senior (10+ yrs) -> climate leadership', locale: 'en', text:
`Elena Petrova, Zurich. 16 years in energy. Currently VP, Strategy & Business Development at a large utility, owning M&A and the renewables growth portfolio (~CHF 2bn). Led the acquisition of a 500MW wind portfolio. I want a Chief Sustainability Officer or Head of Energy Transition role at a major corporate or infrastructure investor. Possibly an executive MBA but probably not. Timeline 6-12 months.` },

  { id: 13, name: 'Finance pro, NO green background -> impact investing', locale: 'en', text:
`Ryan Murphy, New York. 7 years in finance: 3 in investment banking (M&A) and 4 at a traditional private equity fund doing leveraged buyouts in industrials. I have NO sustainability, climate, or impact experience whatsoever. I want to move into impact investing or climate-focused PE. I keep getting told I'm "not mission-aligned enough." No MBA needed (already have strong pedigree). Timeline 6 months.` },

  { id: 14, name: 'Greenwashing seeker — mostly marketing/ops, few ESG keywords', locale: 'en', text:
`Chloe Martin, Sydney. 6 years in brand marketing and communications at a consumer company. Senior Brand Manager. I ran a campaign about our "sustainable" product line and helped write the company's sustainability page and some CSR communications. I now call myself a "sustainability marketer" and want a green/ESG role. Honestly most of my work is marketing and ops; my actual hands-on ESG/climate work is thin. No MBA. Timeline 6 months.` },

  { id: 15, name: 'Bilingual: Chinese CV -> native zh-TW report', locale: 'zh-TW', text:
`林佳穎，台北。現職：某上市電子製造公司 永續發展部 資深專員，年資 5 年。負責公司溫室氣體盤查（ISO 14064）、CDP 問卷、TCFD 報告撰寫，並協助導入 SBTi 減碳目標。先前 3 年在管理顧問公司做流程改善。我想從「報告與盤查」轉向「氣候策略與減碳專案管理」，希望進到企業的永續策略團隊或氣候顧問。沒有要念 MBA。預計一年內轉換。英文中等、中文母語。` },

  { id: 16, name: 'Messy resume (bad PDF, unclear timeline/titles)', locale: 'en', text:
`john — resume\n\nworked various roles. company A (some years) did stuff with energy and reports. then company B — sustainability-ish things, projects, helped teams. also did consulting maybe. skills: excel, powerpoint, "sustainability", communication, leadership. education: university, business.\n\nlooking for: a good green job. open to lots of things. not sure about timeline.` },
];

function only(): Set<number> | null {
  const i = process.argv.indexOf('--only');
  if (i < 0) return null;
  return new Set(process.argv[i + 1].split(',').map((s) => Number(s.trim())));
}

async function run(p: P) {
  const out: string[] = [];
  out.push(`\n${'#'.repeat(80)}\n# Persona ${p.id}: ${p.name}  [${p.locale}]`);
  try {
    const profile = await callPrompt(profileExtractionPrompt, { inputType: 'notes_paste', rawText: p.text, locale: p.locale });
    out.push(`EXTRACT: role=${profile.identity.current_role ?? '?'} | seniority=${profile.identity.seniority ?? '?'} | yrs=${profile.identity.years_experience ?? '?'}`);
    out.push(`  mba_intent=${profile.intent.mba_intent} | timeline=${profile.intent.timeline} | green_depth=${profile.green_economy.depth} | overall_conf=${profile.confidence.overall}`);
    out.push(`  sectors=${JSON.stringify(profile.green_economy.sectors)} functions=${JSON.stringify(profile.green_economy.functions)} domains=${JSON.stringify(profile.green_economy.domains)}`);

    const scored = await scoreAndClassify(profile, []);
    out.push(`CLASSIFY: category=${scored.classification.category} | primary=${scored.classification.primary_offer} | secondary=${scored.classification.secondary_offer ?? '-'} | grade=${scored.classification.lead_grade} | limitedData=${scored.limitedData} | degraded=${scored.degraded}`);
    out.push(`  indices: story=${scored.summary.story_index} mba=${scored.summary.mba_index} climate=${scored.summary.climate_index} avg=${scored.summary.avg_score}`);

    const report = await generateReport(p.locale, profile, scored);
    const keys = ['current_positioning','core_story_gap','green_career_fit','mba_readiness','recommended_next_move','suggested_paid_next_step'] as const;
    for (const k of keys) out.push(`\n  [${k}]\n  ${report.sections[k]?.body ?? '(MISSING)'}`);
    if (report.degraded) out.push('  !! report degraded');
  } catch (e) {
    out.push(`  ERROR: ${(e as Error).message}`);
  }
  return out.join('\n');
}

(async () => {
  const sel = only();
  const list = personas.filter((p) => !sel || sel.has(p.id));
  // run in small batches to limit concurrency pressure
  for (const p of list) {
    const r = await run(p);
    console.log(r);
  }
})();
