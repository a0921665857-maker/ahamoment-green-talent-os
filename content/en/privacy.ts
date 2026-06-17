import type { PrivacyPageContent } from '../schema';

export const privacyPage: PrivacyPageContent = {
  title: 'Privacy & data',
  intro:
    'This page says plainly what we collect, how long we keep it, and what we never do. It is written to be read, not skimmed past.',
  sections: [
    {
      heading: 'What we collect',
      body: 'The materials you choose to share (CV, pasted text, transcripts), the answers you type, your email and optional name, and anonymous funnel events (which steps were reached — never the content of your materials). Voice audio is never stored; we accept transcripts only.',
    },
    {
      heading: 'How it is used',
      body: 'Only to generate your report and, if you later choose a paid service, to prepare for that work. AI processing extracts a profile that deliberately excludes phone numbers, addresses, and personal emails.',
    },
    {
      heading: 'How long we keep it',
      body: 'Raw uploads and pastes are automatically deleted after 90 days. Your report and extracted profile remain available to you until you ask us to delete them.',
    },
    {
      heading: 'What we never do',
      body: 'We never use your data to train AI models. We never sell or share it. We never publish your materials as examples or testimonials without your explicit written permission. We never access your LinkedIn, ChatGPT, or Claude accounts — you choose what to paste.',
    },
    {
      heading: 'Your choices and rights',
      body: 'You can correct how your background was read on the confirmation page before any judgment is made. You can opt in — or not — to anonymized aggregate insights. And you can have everything deleted: one email, completed within 7 days.',
    },
  ],
  contactLine: 'Deletion requests and any questions: {{email}}',
};
