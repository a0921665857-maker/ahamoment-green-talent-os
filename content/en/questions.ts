import type { QuestionsContent } from '../schema';

export const questions: QuestionsContent = {
  intro: {
    title: 'A few things your material did not tell us',
    body: 'Three to five quick questions — only the ones we actually could not read. They sharpen the report considerably.',
  },
  introComplete: {
    title: 'Your material covered everything — no follow-ups needed',
    body: 'We only ask when something cannot be read from your material, and this time nothing is missing. Leave an email and your report starts generating right away, saved to a link you can return to.',
  },
  emailGate: {
    // Report-delivery framing; adjusted to honest copy 2026-06-15 with founder approval.
    // 2026-08-08 UX audit: the old line promised the report "appears on screen
    // immediately" while generation actually takes 3–5 minutes — a breach of
    // UX_PRINCIPLES #5 (honest progress). Now it forecasts honestly instead.
    title: 'Leave your email and the report comes to you',
    body: 'The report is not instant — it usually takes three to five minutes to write. When it is done we email it to you, and it stays saved at this link so you can come back to it anytime.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    nameLabel: 'Name (optional)',
    namePlaceholder: 'How should the report address you?',
  },
  submit: 'Generate my report',
  questions: {
    q_target_move: {
      label: 'What role or move are you aiming for next?',
      type: 'text',
      placeholder: 'e.g. carbon markets BD in Singapore, in-house sustainability strategy, undecided between two paths…',
    },
    q_timeline: {
      label: 'When do you want this move to happen?',
      type: 'select',
      options: [
        { value: '<6m', label: 'Within 6 months' },
        { value: '6-12m', label: 'In 6–12 months' },
        { value: '12m+', label: 'More than a year out' },
        { value: 'unknown', label: 'Not sure yet' },
      ],
    },
    q_mba_intent: {
      label: 'Where does an MBA sit in your plans?',
      type: 'select',
      options: [
        { value: 'active', label: 'Actively applying' },
        { value: 'considering', label: 'Seriously considering' },
        { value: 'later', label: 'Maybe later' },
        { value: 'no', label: 'Not for me' },
      ],
    },
    q_geography: {
      label: 'Which markets are you targeting?',
      type: 'text',
      placeholder: 'e.g. Singapore, Greater China, stay regional, go global…',
    },
    q_commercial_ownership: {
      label: 'Have you ever owned a commercial number?',
      type: 'select',
      options: [
        { value: 'revenue', label: 'Yes — revenue or sales targets' },
        { value: 'budget', label: 'Yes — a budget or P&L line' },
        { value: 'no', label: 'Not directly' },
        { value: 'unsure', label: 'Hard to say' },
      ],
    },
    q_quantified_result: {
      label: 'Share one result you can put a number on.',
      type: 'text',
      placeholder: 'e.g. cut a client\u2019s Scope 3 baseline effort by 40%, closed US$300k in renewals, led a team of 6…',
    },
    q_green_focus: {
      label: 'Which green-economy areas have you actually worked in?',
      type: 'text',
      placeholder: 'e.g. SBTi target setting, CBAM readiness, carbon credit due diligence, ESG reporting…',
    },
    q_recent_achievement: {
      label: 'What is the achievement from the last two years you would defend in an interview?',
      type: 'text',
      placeholder: 'One concrete thing — what you did, and what changed because of it.',
    },
  },
};
