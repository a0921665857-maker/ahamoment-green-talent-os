import type { PaidOffersContent } from '../schema';

export const paidOffers: PaidOffersContent = {
  title: 'If you want to go deeper',
  intro:
    'This report can tell you how the market reads you now. What it can’t do is sit across from you, listen to the project you never put on your CV, and tell you how to say that part so you get read as who you actually are. Those 30 minutes, I give you for free.',
  primaryLabel: 'Recommended for your result',
  entryLabel: 'Low-risk entry point',
  anchorLabel: 'The full journey',
  earlyBird: 'Early-bird',
  allServicesCta: 'See all services & pricing',
  bookingNote:
    'Both services start with a 30-minute positioning call: I ask you three questions, work out which decision you are actually facing, and tell you whether I can help. If I can, I tell you the price on that call. If I can’t, I say that instead.',
  confidentiality:
    'Calls are private. Your materials are never used as public examples or testimonials without your explicit written permission.',
  bookCta: 'Book the 30-minute call',
  notIncludedLabel: 'What this does not do',
  decisionMomentLabel: 'The decision you are standing in front of',
  stickyCall: 'Free 30-min read',
  stickyLine: 'Add LINE',
  recommendedLabel: 'Where most people start',
  freeHeroCta: 'Book 30 min and rewrite what gets misread',
  freeReassure: 'Free · no pitch · if it’s not a fit I’ll say so',
  freeAgenda:
    'What happens in the 30 minutes:\n· First 10 min: you talk, I listen.\n· Next 15 min: I tell you straight what the market reads you as today, which line caused it, and what to say instead so you get read right.\n· Last 5 min: if a paid service fits, I’ll say so; if not, I’ll say that too.\nNo slides, no hard sell — people who tell the truth don’t need to pressure you.',
  paidDivider: 'Want to go deeper, faster? Options matched to your result — but you can always start with the free chat above.',
  founderLine:
    'I’m Michael. I went from Big 4 ESG consultant to INSEAD to the front line of carbon markets — and the hardest part was realising my title didn’t translate in an interviewer’s eyes; I had to learn to say who I am from scratch. The road you’re about to walk, I’ve walked it, and I remember every place it gets stuck. This call is me, personally — not an assistant, not a form.',
  replyPrompt: 'Not ready to book a slot? Just reply with one question — I read and answer every one myself, not a bot.',
  replyCta: 'Reply with one question',
  replyEmail: 'mri@ahamoment-career.com',
  inlineCta: {
    line: 'If anything so far made you want to push back — or ask “so what do I actually do” — ask me directly. I answer personally, not a bot.',
    bookCta: 'Free 30 min — I’ll walk you through it',
    replyCta: 'Reply with one question',
  },
  offers: {
    intro_call_free: {
      name: '30-minute positioning call',
      price: 'Free',
      delivery: 'One 30-minute call, no written deliverable.',
      forWhom: 'Anyone standing in front of a specific decision who wants to check the direction first.',
      decisionMoment: 'You have a decision to make and you are not sure what to judge it against.',
      blurb:
        'The 30 minutes run the same way every time: I ask you three questions to work out which decision you are actually facing, tell you the one thing I think you should do next, then say whether I can help with it and what it costs. If you don’t need a paid service, I say that instead.',
      notIncluded: [
        'Not a full career consultation — 30 minutes is not enough time for that.',
        'No CV edits, no writing anything on your behalf.',
        'No promises about offers, salary, or referrals.',
      ],
    },
    offer_path_read: {
      name: 'Offer & Path Read',
      delivery: 'A 60–90 minute one-to-one call, plus a one-page written memo within 48 hours.',
      forWhom:
        'People holding an offer, or choosing between two paths. You already have career capital — what you are short of is judgement, not information.',
      decisionMoment: 'You have an offer, or you have to pick one of two roads, and there is a clock on it.',
      blurb:
        'We take the decision apart: what the offer terms actually mean, whether the level is a lateral move or a downlevel, what is genuinely left after tax and cost of living if the role is in Singapore, whether you clear the EP salary threshold, where the negotiable room sits — and, most importantly, what you give up by saying no. Within 48 hours I write the judgement up as a one-page memo you can take to a partner or family.',
      notIncluded: [
        'I do not negotiate with your employer, and I never contact them on your behalf.',
        'No promises about salary outcomes or offers.',
        'No legal, tax, or immigration advice — where that comes up, I tell you who to ask.',
      ],
    },
    mba_story_teardown: {
      name: 'MBA Story Teardown',
      delivery: 'A 90-minute one-to-one call, plus a one-page written memo within 48 hours.',
      forWhom: 'Applicants whose story reads like everyone else’s.',
      decisionMoment: 'You are about to submit, and your story sounds like a thousand other applications.',
      blurb:
        'I went from Big 4 ESG consulting into INSEAD, and the hardest part was realising my title did not translate for an admissions committee. These 90 minutes do the same work on yours: what your experience actually proves, whether Why MBA and Why now hold up as cause and effect, whether your stated goal genuinely needs the degree, and which piece of your material is missing. The memo captures the narrative spine we land on and the gap list.',
      notIncluded: [
        'No essay writing, no editing, no proofreading.',
        'No school list and no admit-odds prediction — nobody can calculate that honestly.',
        'No admission promises, and no recommendation letters.',
      ],
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
      priceNote: 'Optional hybrid: a lower base fee + a success bonus only if you are admitted or win a scholarship — shared risk.',
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
      priceNote: 'Optional hybrid: a lower base fee + a success bonus when you hit the goal (admission / scholarship / offer).',
      delivery: 'Eight weeks, end to end.',
      forWhom: 'Professionals targeting international roles or MBA admissions, committed, and wanting the whole arc handled by one accountable person.',
      blurb:
        'Everything above, sequenced: positioning, story, documents, and interview readiness — finished, not just advised on.',
    },
  },
};
