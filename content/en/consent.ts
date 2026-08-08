import type { ConsentContent } from '../schema';

/** Binding copy v1 — PRIVACY_AND_CONSENT.md. Do not edit without updating that doc. */
export const consent: ConsentContent = {
  processing: {
    label: 'I agree that my uploaded materials will be processed by AI to generate my Green Career MRI report.',
    detail:
      'Your materials are used only to create your report and, if you choose to work with us, to prepare for that work. Raw uploads are automatically deleted after 90 days. We never use your data to train AI models, and we never share or publish it. You can ask us to delete everything at any time.',
  },
  aggregate: {
    label: 'Optional: my anonymized profile data may be included in aggregate market insights (never identifiable, never your documents).',
  },
  redactHint: 'Feel free to remove names or contact details before uploading — the analysis works without them.',
  // 2026-08-08: reworded as an access statement, not a reading promise. The old
  // line ("He can read what you pasted…") read as a guarantee that he personally
  // reads every submission — a claim this copy is not allowed to make on his behalf.
  whoSeesIt:
    'Who has access: Michael, and nobody else. His is the only account on the admin side, so what you paste can be retrieved by him alone — for the read itself, and to prepare a conversation if you later book one. There is no team, no outsourcing, and no other account.',
  noAccessNote: 'We never access your LinkedIn, ChatGPT, or Claude accounts. You choose what to share.',
  retentionSummary: 'Raw uploads auto-delete after 90 days. Delete everything anytime.',
  privacyLinkLabel: 'Privacy & data',
};
