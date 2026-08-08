import type { JudgmentContent } from '../schema';

/**
 * English chrome for 綠領判斷力. The module's substance — the competency graph,
 * the 26 explainers, the 12 judgement reps — is written in Traditional Chinese
 * and stays that way (UX_PRINCIPLES rule 10: bilingual parity, not translation).
 * `zhOnlyNotice` says so at the top of the page rather than pretending otherwise.
 */
export const judgment: JudgmentContent = {
  meta: {
    title: 'Green-collar judgement: the gap is judgement, not information',
    description:
      '26 competency nodes, 26 three-minute explainers, 12 judgement reps. You commit to an answer before any reasoning appears, and every wrong option tells you why it was tempting. Written in Traditional Chinese.',
  },
  eyebrow: 'Free · no email required',
  title: 'Green-collar judgement',
  lede: 'Green-collar work sits on the seam between sustainability and finance. People arriving from engineering, CSR or communications stall on the finance half; people arriving from finance stall on inventory boundaries and disclosure standards. This module covers only that seam.',
  backLink: 'Free MRI',
  zhOnlyNotice: {
    body: 'This module is written in Traditional Chinese only. Nothing here has been machine-translated, so the English version does not exist yet rather than existing badly. The interface below is in English; every competency, explainer and exercise is in Chinese.',
    cta: 'Read it in 繁體中文',
  },
  beta: {
    tag: 'BETA',
    body: 'First public version, still growing. If something is wrong, unclear, or does not match your company, write to me. I answer, and I change it.',
    mailSubject: 'Green-collar judgement feedback',
  },
  tabs: {
    start: 'Where you are',
    gaps: 'Your gaps',
    reps: 'Judgement reps',
    map: 'Knowledge map',
  },
  bandLead: 'Based on what you ticked, you are currently at: {band}.',
  bandNone: 'Nothing ticked yet, so there is no signal to read.',
  start: {
    backgroundTitle: 'Which door did you come in through?',
    backgroundHint: 'This shapes what your gaps look like. There is no right answer; pick the closest.',
    backgrounds: {
      eng: {
        label: 'Engineering, process, environmental',
        hint: 'You can calculate the emissions; the proposal stalls in the finance department.',
      },
      csr: {
        label: 'CSR, sustainability, communications',
        hint: 'You can write the report; you cannot say what it is worth.',
      },
      fin: {
        label: 'Finance, banking, investment',
        hint: 'You know discounting and coverage ratios; inventory boundaries and standards are unfamiliar.',
      },
      other: {
        label: 'Other, student, changing careers',
        hint: 'You want to know where to start so the effort is not wasted.',
      },
    },
    domainTitle: 'Which of these have you actually done yourself?',
    domainHint:
      'Tick only what you have done with your own hands and can describe in detail. Ticking earns you nothing; it only makes the next page accurate. This is not a résumé.',
    cta: 'Show my gaps',
    ctaBlocked: 'Pick a background first.',
  },
  gaps: {
    needBackground: 'Go back to the first step and pick a background.',
    stateTitle: 'Where you stand',
    stateNote: 'This is not a score and not a ranking. It is a map.',
    weakSignalNote: ' (weak signal)',
    backgroundBasis: '{label} background',
    haveTitle: 'You appear to have',
    maybeTitle: 'Signal too weak, confirm it yourself',
    maybeHint:
      'A keyword on a résumé is not the same as being able to do it. For each of these, can you give one concrete example? If not, treat it as a gap.',
    gapTitle: 'Suggested starting points',
    gapRule:
      'Ordering: competencies whose prerequisites you already hold come first, then the finance-side ones, which are the scarcest and hardest to outsource half of this field.',
    basisLabel: 'Basis: ',
    financeTag: 'Finance side',
    sustainabilityTag: 'Sustainability side',
    whyPaysLabel: 'Why people who have this get paid more: ',
    timeLabel: 'Zero to entry level: ',
    explainerSummary: 'Three-minute explainer',
    explainerPending: 'This explainer is still being written.',
    explainerAsOf:
      'Rules, deadlines and figures in this explainer were checked on {date}. Regulations move: if that date looks old, confirm against the official notice.',
    volatileAsOf: 'This one tracks the regulations. Checked {date}',
    repsAttached: '{n} judgement reps train this competency',
    moreLabel: 'The remaining {n} competencies',
    cta: 'Go to the judgement reps',
  },
  reps: {
    title: 'Judgement reps',
    rule: 'One rule: you commit before you see any reasoning. Reading the answer does nothing. You have to bet on one first, or the mistake will not stick. Five to ten minutes each.',
    asOf: 'Regulations and figures in this exercise were checked on {date}',
    stateTitle: 'Your practice state',
    storageNote:
      'Your selections and answers stay in this browser on this device. Nothing is uploaded, and they disappear if you switch device.',
    backToList: 'Back to the list',
    backToMap: 'Back to this one on the map',
    start: 'Start this one',
    again: 'Open it again',
    answeredPending: 'You have committed but have not opened the answer.',
    answeredWith: 'You chose {key}',
    minutes: 'about {n} min',
    gate: {
      title: 'Before the answer: why did you choose {key}?',
      hint: 'One line is enough. Being asked is the point: it forces the instinct into a reason, and you will see your own words next to the answer in a moment.',
      placeholder: 'I chose it because',
      submit: 'Done, show the answer',
      skip: 'Skip',
    },
    reveal: {
      choiceLine: 'You chose {key}',
      bestIs: ', the best answer is {key}',
      yourReasonLabel: 'The reason you wrote',
      skippedLabel:
        'You skipped writing a reason. You can still add one; it stays in this browser.',
      addReasonPlaceholder: 'Adding one now still counts',
      takeawayLabel: 'Take this away',
      reasoningTitle: 'How someone who has made this decision thinks',
      breakdownSummary: 'Option by option: why the wrong ones look so reasonable',
      temptingLabel: 'Why this option is tempting: ',
      failureTitle: 'How this fails in the real world',
      sourcesLabel: 'Sources',
      checkedOn: 'checked {date}',
    },
    verdicts: {
      best: 'Best answer',
      defensible: 'Workable, at a price',
      wrong: 'This one bites',
    },
    empty: 'The exercises are still being written.',
  },
  map: {
    title: 'Knowledge map',
    intro:
      'Four layers, top to bottom. The lower a competency sits, the more of the ones above it you need first. Open any of them to see what has to come first and what it leads to.',
    legendTitle: 'How to read this',
    legendBody:
      '{n} nodes sit on the finance half, which is where people from an environmental background stall and which is hardest to outsource. The line on the left is your own state; it appears once you pick a background.',
    depthLabel: 'Depth: ',
    depths: ['Can start today', 'Needs one layer', 'Needs two', 'Needs three'],
    statuses: { have: 'Appears present', maybe: 'To confirm', gap: 'Gap' },
    tierCount: '{n} of them',
    readyNow: 'Nothing to learn first. Start today.',
    needFirst: 'First you need: {name}',
    prereqsMet: 'You already have what comes first',
    unlocks: 'Opens up {n} more',
    prereqTitle: 'What has to come first',
    openCard: 'Full write-up',
    cartographicNote: 'Position shows only how many layers come first, not difficulty or importance.',
    overviewTitle: 'The whole field',
    overviewHint: 'Each dot is one competency; each line means "you need this one first", running downward. Tap any dot and its route is drawn below.',
    legendHub: 'The number in a ring is how many competencies need this one',
    legendTerminus: 'A small solid dot means nothing else needs it',
    legendFinance: 'A square is the finance side',
    isolatedNote: 'The dashed one has no prerequisite relationship to the other 25',
    startTitle: 'Five with nothing to learn first',
    opensN: 'This one opens up {n} more',
    opensNone: 'This one stands alone and opens nothing',
    routeTitle: 'Show the route',
    routeCount: '{n} stops on this route',
    roleUp: 'Needed first',
    roleFocus: 'This one',
    roleDown: 'Then you can learn',
  },
  exit: {
    title: 'What does this look like at your company?',
    body: 'Write me one line. It does not need to be long; just say where you are stuck. I will reply with one concrete next step. No charge, and you are not added to any list.',
    betaNote:
      'This version is still changing. If something reads wrong, or a section did not help, say so. That is the most useful thing you can send me.',
    mailSubject: 'Re: ',
  },
  about: {
    summary: 'What this is, and why it works this way',
    title: 'What this is',
    intro:
      'A way for people who never went to business school to acquire the judgement green-collar work actually asks for. It currently holds {competencies} competency nodes, {explainers} three-minute explainers and {reps} judgement reps.',
    blocks: [
      {
        heading: 'Why this is not another online course',
        body: 'Information has been free for years. What is expensive is three things: someone deciding which parts you need, someone telling you where your thinking went wrong, and concrete situations to practise judgement on. This does only those three.',
      },
      {
        heading: 'Why the reps hide the answer until you commit',
        body: 'Reading an answer makes you feel you understand it, and then you discover you do not when a real decision arrives. Bet on one option first and you will remember why it was wrong. That is also why every wrong option explains why it was tempting: the expensive part of a case discussion is never hearing the right answer, it is hearing why your wrong answer was wrong.',
      },
      {
        heading: 'This version is beta',
        body: 'Everything here is written and source-checked, but this is the first public release. It will change as the regulations change and as readers push back. If something is wrong, missing or unclear, write to me. At this stage feedback beats applause.',
      },
    ],
    identityTitle: 'Who made this',
    identityMail: 'Questions go straight to my inbox. I answer them myself.',
    honestTitle: 'Plainly stated',
    honestPoints: [
      'Everything here is original writing with public, checkable sources. No school material, no purchased material, no client data.',
      'Regulatory figures expire. Where a date is shown, verify the current position yourself.',
      'The first step is not a score and is not sent anywhere: your selections and answers stay in this browser on this device, and disappear if you switch device.',
      'Nothing here is legal, tax or investment advice.',
    ],
  },
  footer: {
    origin:
      'Everything on this page is original writing, with a public, checkable source behind every fact. No school material, no purchased material, no client data.',
    disclaimer:
      'Regulatory figures expire. Where a date is shown, treat it as of that date and verify the current position yourself. Nothing here is legal, tax or investment advice.',
  },
};
