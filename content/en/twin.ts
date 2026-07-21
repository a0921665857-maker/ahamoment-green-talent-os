import type { TwinContent } from '../schema';

export const twin: TwinContent = {
  request: {
    title: 'Career file: your MRIs, joined into one line',
    intro:
      'One report is a snapshot of one day. If you have run the MRI more than once, this page joins those reports so you can see what actually changed. Currently open to paying clients and invitees only.',
    emailLabel: 'The email you used for your MRI',
    emailPlaceholder: 'you@example.com',
    submitCta: 'Send me a sign-in link',
    sentNote: 'If this email is on the access list, a sign-in link is on its way and stays valid for 24 hours. Check spam, or just reply to any of my emails.',
    inviteNote: 'Not on the list yet? Any paid service unlocks it — or write to me and tell me your situation.',
    invalidEmail: 'That email does not look right — give it another look.',
  },
  hub: {
    title: 'Your career file',
    intro: 'Every MRI you have completed, newest first.',
    latestLabel: 'Latest',
    reportCta: 'Open this report',
    diffTitle: 'Compared with last time',
    diffIntro: 'Movement across the nine index bands. Read the direction, not single-cell noise.',
    needTwo: 'No two reports to compare yet. When your situation changes, run the MRI — once there are two, the comparison appears here.',
    upWord: 'Up',
    downWord: 'Down',
    sameSummary: '{n} unchanged',
    unknownWord: 'Not enough data',
    updateTitle: 'Situation changed?',
    updateBody: 'A new role, an offer in hand, new evidence — worth a fresh scan. The new report joins this line automatically.',
    updateCta: 'Update my file (run the MRI again)',
    expiredTitle: 'This link has expired',
    expiredBody: 'Sign-in links last 24 hours to protect your reports. Just request a fresh one.',
    requestAgainCta: 'Get a new link',
  },
  bandNames: {
    story_index: 'Story spine',
    mba_index: 'MBA composite',
    climate_index: 'Climate lane index',
    commercial_credibility: 'Commercial credibility',
    international_positioning: 'International positioning',
    interview_readiness: 'Interview readiness',
    cv_readiness: 'CV readiness',
    green_economy_fit: 'Green economy fit',
    mba_readiness: 'MBA readiness',
  },
  resultLink: {
    prompt: 'This report is a snapshot of today. Paying clients can join their MRIs into a career file and track the change.',
    cta: 'About the career file',
  },
};
