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
    {
      heading: 'Who processes your data (and where)',
      body: 'This site is run by one person, but it runs on other people’s infrastructure and you are entitled to know whose: Vercel (hosting), Supabase (the database your data actually lives in), Anthropic (the AI read — it receives the material you paste), Resend (email), PostHog (anonymous product analytics), Cal.com or Calendly (booking). Their data centres are not necessarily in your country, so your data is processed across borders. Nobody outside that list touches it.',
    },
    {
      heading: 'Cookies and analytics',
      body: 'PostHog records anonymous usage (which pages open, where people drop out) and sets a cookie and localStorage entries in your browser. Those records contain no name, no email, no CV content and nothing that points back to you personally. Session recording is off by default. Private browsing or a cookie blocker avoids it entirely and every feature still works.',
    },
    // 2026-08-08 UX audit removed the "Payment data" section and Stripe from the
    // processor list: this site takes no online payment and has no checkout. Money
    // changes hands after a call, paid to Michael personally. A privacy page that
    // describes card processing only confirms a sceptic's suspicion that there is a
    // hidden paywall somewhere on the site.
  ],
  contactLine: 'Deletion requests and any questions: {{email}}',
};
