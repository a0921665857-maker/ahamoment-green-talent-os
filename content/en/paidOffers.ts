import type { PaidOffersContent } from '../schema';

export const paidOffers: PaidOffersContent = {
  title: 'If you want to go deeper',
  intro:
    'Based on your MRI, the highest-leverage next step is shown first. No bundles, no upsells in the call — the diagnosis above is the pitch.',
  primaryLabel: 'Recommended for your result',
  entryLabel: 'Low-risk entry point',
  anchorLabel: 'The full journey',
  earlyBird: 'Early-bird',
  allServicesCta: 'See all services & pricing',
  creditPolicy:
    'Teardown fee credits 100% toward any sprint or package booked within 30 days.',
  confidentiality:
    'Human review is private. Your materials are never used as public examples or testimonials without your explicit written permission.',
  bookCta: 'Book a time',
  offers: {
    intro_call_free: {
      name: 'Free 30-Minute Chat',
      price: 'Free',
      delivery: 'One 30-minute call, no written deliverable.',
      forWhom: 'Anyone still deciding whether this is the right direction.',
      blurb: 'No pitch, no scoring — 30 minutes on your situation to see whether this read is useful to you and worth taking further.',
    },
    deep_read: {
      name: 'Deep Read',
      price: 'US$39',
      originalPrice: 'US$49',
      delivery: 'Asynchronous written read, delivered within 48 hours.',
      forWhom: 'People who want a deeper written read to revisit, without a call yet.',
      blurb: 'We take your MRI one layer deeper: your three strongest assets, the one gap that matters most, and concrete next steps — all in writing, yours to keep.',
    },
    consult_60: {
      name: '60-Minute Diagnostic Consult',
      price: 'US$69',
      originalPrice: 'US$89',
      delivery: 'One 60-minute call.',
      forWhom: 'People who want one-on-one time to settle their direction in one sitting.',
      blurb: 'Deeper than the free chat, lighter than the teardown: an hour to settle your positioning, target lane, and next move — with an actionable direction by the end.',
    },
    teardown_90: {
      name: '90-Minute Story Teardown',
      price: 'US$99',
      originalPrice: 'US$129',
      delivery: 'One 90-minute working call, plus a written memo within 72 hours.',
      forWhom: 'Anyone who wants a candid human read on their positioning, fast.',
      blurb:
        'We go through your actual materials together, name your through-line, and leave you a memo with the three changes that matter most.',
    },
    cv_linkedin_review: {
      name: 'CV & LinkedIn Review',
      price: 'US$99',
      originalPrice: 'US$129',
      delivery: 'Asynchronous written review, plus a 30-minute call.',
      forWhom: 'People whose story is settled but whose documents undersell it.',
      blurb:
        'Line-level review of how your documents carry your story — what to cut, what to surface, what a screener actually sees in six seconds.',
    },
    climate_positioning_sprint: {
      name: 'Climate Career Positioning Sprint',
      price: 'US$320+',
      originalPrice: 'US$390+',
      delivery: 'Three working sessions over three weeks.',
      forWhom: 'Professionals choosing between climate lanes, or translating technical work into commercial language.',
      blurb:
        'We settle your target lane, name your differentiation, and map the two moves that get you there — with your evidence, not generic advice.',
    },
    mba_story_sprint: {
      name: 'One-School MBA Story Sprint',
      price: 'US$390+',
      originalPrice: 'US$590+',
      delivery: 'Four sessions over four weeks, focused on one target school.',
      forWhom: 'Applicants with a clear target who need the full narrative built.',
      blurb:
        'Positioning, essay direction, and interview spine for one school, built from your real material. Assistive, never ghost-written.',
    },
    mock_interview_pack: {
      name: 'AI + Human Mock Interview Pack',
      price: 'US$129+',
      originalPrice: 'US$159+',
      delivery: 'Structured AI practice reps, plus one to two live mock sessions with written feedback.',
      forWhom: 'Candidates at interview stage within the next few months.',
      blurb:
        'Unlimited reps where stakes are low, then live pressure where it counts — with feedback on substance, not just delivery.',
    },
    offer_negotiation: {
      name: 'Green-Collar Offer & Salary Negotiation Coaching',
      price: 'US$129',
      originalPrice: 'US$159',
      delivery: 'One 60-minute strategy call, plus a written negotiation prep memo.',
      forWhom: 'People with an offer in hand (or imminent) who want to negotiate it well.',
      blurb: "Using INSEAD's seven-element negotiation framework, we map this offer's leverage, your alternatives, and the other side's limits, and prep your opening, concession order, and key lines — for your real situation, not a generic script.",
    },
    climate_finance_transition: {
      name: 'Climate Finance / Impact Investing Transition Sprint',
      price: 'US$390+',
      originalPrice: 'US$490+',
      delivery: 'Three working sessions over three weeks, plus a target-role fit analysis.',
      forWhom: 'Professionals moving from ESG/sustainability advisory into climate finance, impact investing, or climate VC.',
      blurb: 'We translate your compliance and advisory experience into capital-markets language: using sustainable-finance and project-finance frameworks to close the gap to a pure-finance background and map a transition path built from your existing evidence.',
    },
    full_package: {
      name: 'Full Green Career / MBA Positioning Package',
      price: 'US$980+',
      originalPrice: 'US$1,560+',
      delivery: 'Eight weeks, end to end.',
      forWhom: 'Committed professionals who want the whole arc handled with one person accountable.',
      blurb:
        'Everything above, sequenced: positioning, story, documents, and interview readiness — finished, not just advised on.',
    },
  },
};
