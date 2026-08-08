import type { ReportTemplatesContent } from '../schema';

export const reportTemplates: ReportTemplatesContent = {
  reportTitle: 'Green Career MRI',
  reportSubtitle: 'A personal read on your positioning, evidence, and next move.',
  preparedFor: 'Prepared for {name}',
  generatedOn: 'Generated {date}',
  readByFounder: 'I read this one myself. If any part feels off, reply and tell me.',
  limitedDataNote:
    'Based on the material provided, this is a partial scan: some sections carry less signal than usual. The diagnosis is honest about that rather than pretending to certainty.',
  bandLabels: { emerging: 'Emerging', developing: 'Developing', strong: 'Strong' },
  notEnoughSignal: 'Not enough signal yet',
  categoryLabel: 'Your result',
  nextMoveReadinessTitle: 'Readiness for your next move',
  sections: {
    current_positioning: {
      title: 'Current positioning',
      fallback:
        'Your material shows a professional in transition within the green economy. A fuller positioning statement needs a touch more signal than this scan captured.',
    },
    hidden_strengths: {
      title: 'Hidden strengths',
      fallback:
        'There are strengths in your material that your current framing undersells. A human read in a teardown session would name them precisely.',
    },
    underused_story_assets: {
      title: 'Underused story assets',
      fallback:
        'Specific projects and numbers in your background are doing less narrative work than they could.',
    },
    core_story_gap: {
      title: 'The core story gap',
      fallback:
        'The main gap in your story could not be pinned down reliably from this material — which is itself a signal worth examining.',
    },
    green_career_fit: {
      title: 'Green career fit',
      fallback: 'Your green-economy fit reads as real but under-specified in the material provided.',
    },
    mba_readiness: {
      title: 'MBA readiness',
      fallback: 'Your MBA readiness could not be banded confidently from this material.',
    },
    commercial_clarity: {
      title: 'Commercial clarity',
      fallback: 'How commercially your impact reads could not be assessed reliably from this scan.',
    },
    international_positioning: {
      title: 'International positioning',
      fallback: 'How well your profile travels across markets needs more signal than this scan captured.',
    },
    interview_readiness: {
      title: 'Interview readiness',
      fallback: 'Interview readiness was not assessable from written material alone in this scan.',
    },
    cv_readiness: {
      title: 'CV readiness',
      fallback: 'CV structure could not be assessed from the material provided.',
    },
    recommended_next_move: {
      title: 'Your recommended next move',
      fallback:
        'The single highest-leverage step: capture your three strongest results in writing, with numbers, this week. Every later move builds on that.',
    },
    suggested_paid_next_step: {
      title: 'If you want a human in the loop',
      // 2026-08-08: the old fallback named the 90-Minute Story Teardown (teardown_90),
      // which sits in ARCHIVED_OFFER_IDS in lib/services.ts and cannot be bought.
      // Now it names no product and points at the door open to everyone.
      // (Same round fixed the eight offerLines in results.ts.)
      fallback:
        'When you want a human read on top of this scan, the entry point is a 30-minute positioning call: I ask three questions and tell you plainly what I think you should do next.',
    },
  },
  footer: {
    deleteLine: 'Want this data deleted? One email — done within 7 days.',
    confidentiality:
      'Human review is private. Your materials are never used as public examples or testimonials without your explicit written permission.',
    returnNote: 'This link is yours — bookmark it to return to your report.',
  },
};
