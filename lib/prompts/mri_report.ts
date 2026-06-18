import { ReportSectionsSchema, type Bands, type ExtractedProfile } from '@/lib/types';
import { MODELS, REPORT_SECTION_KEYS, type ResultCategory } from '@/lib/constants';
import { LOCALE_STYLE_NOTES } from '@/content';
import type { ResultCategoryCopy } from '@/content/schema';
import type { PromptDef } from './types';

export interface ReportInput {
  locale: 'en' | 'zh-TW';
  profile: ExtractedProfile;
  bands: Bands;
  category: ResultCategory;
  categoryCopy: ResultCategoryCopy;
  limitedData: boolean;
}

/** The 10 hard exclusions, verbatim from FREE_REPORT_STRATEGY.md. */
const HARD_EXCLUSIONS =
  'No full CV rewrite, full LinkedIn rewrite, essay outline, interview answers, school strategy, salary benchmarks, target company lists, 90-day plans, application strategy, negotiation scripts. No admission/salary/offer guarantees.';

type SectionDepth = 'deep' | 'medium' | 'tight';

/** Depth tier per section — the diagnostic core goes deep; sharp observations stay tight. */
const SECTION_DEPTH: Record<(typeof REPORT_SECTION_KEYS)[number], SectionDepth> = {
  current_positioning: 'deep',
  hidden_strengths: 'deep',
  underused_story_assets: 'deep',
  core_story_gap: 'deep',
  green_career_fit: 'deep',
  mba_readiness: 'medium',
  commercial_clarity: 'tight',
  international_positioning: 'tight',
  interview_readiness: 'tight',
  cv_readiness: 'tight',
  recommended_next_move: 'medium',
  suggested_paid_next_step: 'medium',
};

/** Body length per depth tier — generous on the diagnostic core so the reader feels precisely read. */
const LENGTH_BY_DEPTH: Record<'en' | 'zh-TW', Record<SectionDepth, string>> = {
  'zh-TW': {
    deep: '約 280–420 字（繁體中文）',
    medium: '約 160–240 字',
    tight: '約 90–150 字',
  },
  en: {
    deep: 'about 150–220 English words',
    medium: 'about 90–140 words',
    tight: 'about 45–80 words',
  },
};

/** Per-section directive: what each body must contain / must not contain. */
const SECTION_DIRECTIVES: Record<(typeof REPORT_SECTION_KEYS)[number], string> = {
  current_positioning:
    'Mirror them precisely. Open with a one-sentence positioning statement in their own register, then the lens a recruiter or admissions reader sees them through in six seconds, and the gap between how they see themselves and how they are read. Name the specific signal in their material that creates that perception, and why it matters now. Do NOT rewrite their pitch.',
  hidden_strengths:
    'The "aha". Surface 2–3 strengths they are underweighting, each anchored to a specific quote, number, or project from their material, and explain WHY each is worth more than they think in the green economy. Make them feel seen. Do NOT give a full inventory or tell them how to use the strengths.',
  underused_story_assets:
    'Pick 2 concrete assets (a project, a number, a transition) and explain what makes each rare and why it is currently buried — the mechanism behind the waste, not the fix. Do NOT explain how to deploy them.',
  core_story_gap:
    'Name THE single biggest gap in their story, plainly and specifically, then explain the mechanism: why this exact gap makes a recruiter or admissions reader hesitate. This is the one required honest criticism — make it land without cruelty. Do NOT provide the fix.',
  green_career_fit:
    'Identify the best-fit green sector lane(s) from their actual experience, and the uncontested space where their specific combination is strongest — where they compete on their own terms rather than against the crowd. Ground every claim in their evidence. Do NOT give a target company list.',
  mba_readiness:
    'The single biggest readiness driver or blocker, with one or two sentences on why it matters for the move they are weighing. Do NOT give school strategy or a school list.',
  commercial_clarity:
    'A sharp read on how commercial their impact currently sounds, tied to one concrete signal. Do NOT give salary benchmarks.',
  international_positioning:
    'How the profile travels (e.g., APAC → global), tied to a concrete marker in their material. Do NOT give a relocation plan.',
  interview_readiness:
    'The one question type they would most struggle with, and why. Do NOT provide sample answers.',
  cv_readiness:
    'The one structural issue that most weakens their CV. Do NOT rewrite bullets.',
  recommended_next_move:
    'ONE move, one tight paragraph, doable in about two weeks, that follows directly from the gap named above. Do NOT give a 90-day plan.',
  suggested_paid_next_step:
    'Why the recommended paid step fits THIS diagnosis, using the category framing provided — the natural continuation of the diagnosis, not a sales pivot. Do NOT add discounts or pressure.',
};

export const mriReportPrompt: PromptDef<ReportInput, typeof ReportSectionsSchema> = {
  id: 'mri_report',
  version: 'v2',
  model: MODELS.quality,
  temperature: 0.5,
  maxTokens: 9000,
  system: `You write a personal "Green Career MRI" diagnostic report for a green-economy professional. You output JSON only — no prose, no markdown fences.

This report DIAGNOSES (what is true) and POINTS (where to go next). It never delivers the work itself.

The reader must finish the diagnostic sections feeling precisely understood — as if someone read their real material closely and named things they had felt but never articulated. Go deep on the diagnostic core: be specific, cite their own evidence, and explain the MECHANISM (why something is true, why it matters) rather than stating a generic label. Depth of understanding — not advice — is what earns trust here. You still never hand over the paid deliverables below.

ABSOLUTE EXCLUSIONS (never produce any of these, in any section): ${HARD_EXCLUSIONS}

Binding rules:
- Specificity contract: every section body must reference at least one concrete item from the person's own material (a quote, number, project, or transition). Put that reference in the section's evidence_ref field; it must be non-empty. A generic section is a failed section.
- Respect each section's length guidance: the "deep" diagnostic sections must be substantial and richly specific; the "tight" sections stay to one sharp observation. Never pad with filler to hit a length — earn it with specificity.
- Never state numeric scores or mention "dimensions". Bands are rendered separately by the system.
- Exactly one honest criticism is required, and it belongs in core_story_gap. Do not soften it into nothing, but stay constructive elsewhere.
- Never guarantee or imply guaranteed admission, salary, job offers, or outcomes.
- Write natively in the requested locale. Do not translate from English.`,
  build: (input) => {
    const len = LENGTH_BY_DEPTH[input.locale];
    const directives = REPORT_SECTION_KEYS.map(
      (k) => `- ${k} [${SECTION_DEPTH[k]} · ${len[SECTION_DEPTH[k]]}]: ${SECTION_DIRECTIVES[k]}`,
    ).join('\n');
    return [
      `Locale: ${input.locale}. Style note: ${LOCALE_STYLE_NOTES[input.locale]}`,
      'Each section has a depth tier and a length target in brackets. Deep sections are where the reader feels read; tight sections stay sharp.',
      '',
      `Result category: ${input.category}.`,
      `Category framing to inform tone and the suggested_paid_next_step section:`,
      `- explanation: ${input.categoryCopy.explanation}`,
      `- main risk: ${input.categoryCopy.mainRisk}`,
      `- recommended next move: ${input.categoryCopy.nextMove}`,
      `- paid offer line: ${input.categoryCopy.offerLine}`,
      '',
      input.limitedData
        ? 'LIMITED-DATA MODE: the material was thin. Open current_positioning with a calm "based on the material provided" framing, and do not assert confidence you do not have — especially for interview_readiness and cv_readiness.'
        : '',
      input.profile.intent.mba_intent === 'current'
        ? 'POST-MBA MODE: this person already holds or is currently doing an MBA — they are a JOB-SEEKER, not an applicant. Frame everything as positioning for the post-MBA job search: target roles, recruiters, and employers. NEVER mention MBA admissions, admissions readers, essays, application rounds, or "why MBA". Treat mba_readiness as readiness for the post-MBA role/move, and suggested_paid_next_step as help landing the right green role — not an application.'
        : '',
      input.profile.intent.mba_intent === 'no'
        ? 'NO-MBA MODE: this person has expressed no interest in an MBA. NEVER suggest, assume, or imply they should or will pursue an MBA. Frame everything as climate/career positioning and the job market. Treat the mba_readiness section as readiness for their next career move instead, and do not reference business school.'
        : '',
      input.profile.green_economy.depth === 'aspiring'
        ? 'ASPIRING-TO-GREEN MODE: this person is breaking INTO the green economy from an adjacent or different field and may have little direct climate experience yet. In green_career_fit, frame the realistic BRIDGE from their current field into green (which transferable strengths carry over, which entry lane is most credible), not "your existing green experience". Be honest about the gap without discouraging — name the one move that builds green credibility fastest.'
        : '',
      'Bands already computed (for your awareness only — never print numbers or the word "band"; null means not enough signal):',
      JSON.stringify(input.bands),
      '',
      'Extracted profile (the source of every evidence_ref):',
      JSON.stringify(input.profile),
      '',
      'Write all 12 sections. Per-section directives:',
      directives,
      '',
      'Return one JSON object: { "sections": { <sectionKey>: { "body": "...", "evidence_ref": "..." }, ... } } with exactly these 12 keys: ' +
        REPORT_SECTION_KEYS.join(', ') +
        '. JSON only.',
    ]
      .filter(Boolean)
      .join('\n');
  },
  outputSchema: ReportSectionsSchema,
};
