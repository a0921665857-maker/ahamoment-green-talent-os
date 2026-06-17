import type { LandingContent } from '../schema';

export const landing: LandingContent = {
  hero: {
    eyebrow: 'For green-economy professionals in APAC',
    title: 'You’re not short on experience — you’re short on positioning people read instantly.',
    credibilityLine:
      'Built by an INSEAD MBA and Big-4 ESG advisor, purpose-made for green-career and MBA positioning.',
    subtitle:
      'The Green Career MRI reads your actual materials — CV, LinkedIn, notes, even an AI-chat transcript — and in 5 minutes returns an honest, personal diagnosis: how you’re read now, your underrated strengths, the one fatal gap in your story, and a single doable next move.',
    cta: 'Run your free MRI',
    secondaryCta: 'See a full sample first',
    timePromise: 'About 5 minutes · Free · No account · See a sample before you start',
    privacyLine:
      'Your materials are used only to generate your report, auto-deleted from raw storage after 90 days, and never used to train AI models. Delete everything anytime.',
    viewExistingReport: 'View your previous report',
  },
  differentiator: {
    title: 'Not another career coach',
    points: [
      'Not a generic MBA consultant — we do one thing: green-economy career positioning.',
      'Not motivational fluff — every line is pinned to your own evidence, with the “why”.',
      'We don’t ghost-write — we make you understood, then give you one move you can do in two weeks.',
    ],
  },
  howItWorks: {
    title: 'How it works',
    steps: [
      {
        title: 'Share what you already have',
        body: 'Upload a CV, or paste your LinkedIn profile, career notes, or a voice transcript. No forms asking you to retype your life.',
      },
      {
        title: 'Confirm what it understood',
        body: 'You see exactly how your background was read — and can correct anything — before a single judgment is made.',
      },
      {
        title: 'Get your MRI report',
        body: 'Twelve short sections, each grounded in your own material: strengths, gaps, green-career fit, MBA readiness, and one concrete next move.',
      },
    ],
  },
  whatYouGet: {
    title: 'What the free report covers',
    intro:
      'A diagnosis, not a sales letter. It tells you what is true about your profile and where to point next — it does not pretend to do the work for you.',
    sectionPreviewNote: 'Twelve sections, each one short enough to read on a commute and specific enough to screenshot.',
  },
  founder: {
    title: 'Who reads the paid work',
    facts: [
      '7 years in Big 4 ESG consulting (Deloitte, KPMG) — SBTi, carbon accounting, CBAM, TCFD',
      'INSEAD MBA, climate-finance focus',
      'Now in carbon markets, covering APAC from Singapore',
      'Works in English and Traditional Chinese',
    ],
  },
  offersTeaser: {
    title: 'If you want to go deeper',
    intro:
      'The MRI is free and complete on its own. For people who want a human in the loop, there is a small set of paid services — from a 90-minute story teardown to a full positioning package. The report will recommend at most one path; the rest stay out of your way.',
    allServicesCta: 'See all services & pricing',
    honestUrgency:
      'An honest nudge: MBA application rounds and transition windows have real deadlines. The earlier your positioning is clear, the more options you keep — not manufactured urgency, just the calendar.',
  },
  finalCta: {
    title: 'Five minutes to an honest read.',
    body: 'The materials you already have are enough. Start there.',
    cta: 'Run your free MRI',
  },
  footer: {
    privacyLink: 'Privacy & data',
    deleteLine: 'Want your data gone? One email — deleted within 7 days.',
    rightsLine: 'AhaMoment · Green Talent OS',
  },
};
