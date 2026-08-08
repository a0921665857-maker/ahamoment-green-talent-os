/**
 * Content contract. Every locale folder must export one const per interface
 * below, fully populated — TypeScript fails the build on any missing key.
 * Translate VALUES, never keys. No user-facing string may live in a component.
 */
import type {
  Band,
  InputType,
  OfferId,
  QuestionId,
  ReportSectionKey,
  ResultCategory,
} from '@/lib/constants';
import type { BackgroundKey, Verdict } from '@/lib/judgment';

export interface LandingContent {
  hero: {
    eyebrow: string;
    title: string;
    credibilityLine: string; // authority + category, directly under the headline
    subtitle: string;
    cta: string;
    secondaryCta: string; // low-commitment "see a sample" path
    timePromise: string;
    privacyLine: string;
    viewExistingReport: string;
  };
  differentiator: { title: string; points: string[] }; // Blue Ocean category boundary
  howItWorks: { title: string; steps: { title: string; body: string }[] };
  whatYouGet: { title: string; intro: string; sectionPreviewNote: string };
  founder: { title: string; facts: string[] };
  offersTeaser: { title: string; intro: string; allServicesCta: string; honestUrgency: string };
  finalCta: { title: string; body: string; cta: string };
  footer: { privacyLink: string; deleteLine: string; rightsLine: string; blogLink: string };
}

export interface FlowContent {
  stepIndicator: { input: string; confirm: string; questions: string };
  intro: { title: string; body: string; reassure: string; sampleCta: string };
  inputTabs: Record<InputType, { tab: string; hint: string; placeholder?: string }>;
  pdf: { dropLabel: string; chooseFile: string; selected: string; remove: string };
  submit: string;
  submitHint: string; // shown under a disabled submit so people know why
  charCount: string; // "{count} characters"
  charCountNeed: string; // below-minimum state: contains {count} and {need}
  progress: {
    extraction: { title: string; stages: string[] };
    report: { title: string; stages: string[]; note: string };
  };
  /** LINE capture rails — "share to my own LINE" is the native bookmark for the
   * Threads in-app-browser audience (mobile audit 2026-07-17). */
  line: {
    noCvTitle: string;
    noCvBody: string;
    saveCta: string;
    addCta: string;
    shareTextMri: string; // human text; the link is appended at click time
    shareTextReport: string;
    generatingHint: string;
    resultTitle: string;
    resultBody: string;
    landingTitle: string;
    landingBody: string;
    endTitle: string;
    endBody: string;
  };
  /** Save-for-later email out on the material step — capture before the paste. */
  saveLater: {
    title: string;
    body: string;
    placeholder: string;
    cta: string;
    done: string;
    invalid: string;
  };
  /** 60-second all-tap quick read — mobile audit's answer to the material-step
   * drop: value before any typing. Maps deterministically to the 8 categories.
   * 2026-07 sweetness rebuild: the result is a screenshot-worthy mini report
   * (misread + verdict + real salary band from the drift-guarded dataset),
   * not just a type label. q5 (sector) exists solely to unlock the band. */
  quick: {
    /** Promoted above-fold entry card (walkthrough F2): the zero-typing door the
     * 80% material-step drop never found as a below-fold text link. */
    entryTitle: string;
    entryBody: string;
    entryButton: string;
    title: string;
    intro: string;
    q1: { label: string; options: { value: string; label: string }[] };
    q2: { label: string; options: { value: string; label: string }[] };
    q3: { label: string; options: { value: string; label: string }[] };
    q4: { label: string; options: { value: string; label: string }[] };
    q5: { label: string; options: { value: string; label: string }[] };
    showResult: string;
    resultEyebrow: string;
    resultNote: string;
    fullCta: string;
    typeDetailCta: string;
    /** Mini-report card copy. Claims must stay consistent with results.ts —
     * the quick card is a compressed echo of the full type copy, never new claims. */
    card: {
      misreadLabel: string;
      verdictLabel: string;
      stuckLabel: string;
      salaryLabel: string;
      salaryLabelSg: string;
      salaryLabelMultiple: string;
      salaryDisposableSuffix: string; // appended when disposable multiple exists
      salarySource: string;
      brandFooter: string;
    };
    /** What the market most often misreads this type as — one line per category. */
    misread: Record<ResultCategory, string>;
    /** The one honest sentence for this type, distilled from results.ts mainRisk. */
    verdict: Record<ResultCategory, string>;
    /** One truth per q3 stuck-point option value. */
    stuck: Record<'value' | 'no_reply' | 'interview' | 'abroad' | 'mba_q', string>;
  };
  confirmation: {
    title: string;
    intro: string;
    identityLabel: string;
    careerLabel: string;
    sectorsLabel: string;
    domainsLabel: string;
    intentLabel: string;
    careerEditPlaceholder: string; // optional correction for career/achievements
    sectorsEditPlaceholder: string; // optional correction for green sectors/domains
    editHint: string;
    notDetected: string;
    confirmCta: string;
  };
  result: { viewCta: string };
}

export interface QuestionOption {
  value: string; // stable across locales
  label: string;
}
export interface QuestionDef {
  label: string;
  type: 'select' | 'text';
  options?: QuestionOption[];
  placeholder?: string;
}
export interface QuestionsContent {
  intro: { title: string; body: string };
  /** Zero-questions state (walkthrough F4): rich material yields no follow-ups;
   * the promise-of-questions copy must not render over a bare email gate. */
  introComplete: { title: string; body: string };
  emailGate: {
    title: string;
    body: string; // binding copy — founder override 2026-06-12
    emailLabel: string;
    emailPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
  };
  submit: string;
  questions: Record<QuestionId, QuestionDef>;
}

export interface ResultCategoryCopy {
  name: string;
  explanation: string;
  whyItMatters: string;
  mainRisk: string;
  nextMove: string;
  offerLine: string;
  cta: string;
}
export type ResultsContent = Record<ResultCategory, ResultCategoryCopy>;

export interface ReportTemplatesContent {
  reportTitle: string;
  reportSubtitle: string;
  preparedFor: string; // "{name}" optional interpolation
  generatedOn: string; // date label
  limitedDataNote: string;
  bandLabels: Record<Band, string>;
  notEnoughSignal: string;
  categoryLabel: string;
  nextMoveReadinessTitle: string; // alt title for mba_readiness when the reader isn't an MBA applicant
  sections: Record<ReportSectionKey, { title: string; fallback: string }>;
  footer: { deleteLine: string; confidentiality: string; returnNote: string };
}

export interface OfferCopy {
  name: string;
  /** Archived offers only. Public prices live in lib/services.ts (single source);
   * leaving this unset for a public offer is deliberate, not an omission. */
  price?: string;
  originalPrice?: string; // strike-through pre-discount price when on early-bird
  priceNote?: string; // e.g. hybrid "base + success bonus" note under the price
  delivery: string;
  forWhom: string;
  blurb: string;
  /** The decision the buyer is standing in front of when this is the right call. */
  decisionMoment?: string;
  /** Explicit scope boundary — what this consultation does NOT do. */
  notIncluded?: string[];
}
export interface PaidOffersContent {
  title: string;
  intro: string; // diagnostic-led framing
  primaryLabel: string;
  entryLabel: string;
  anchorLabel: string;
  earlyBird: string; // small tag shown next to a discounted price
  allServicesCta: string; // link from the report's 3-slot CTA to the full services page
  bookingNote: string; // "every booking starts with a free 30-min chat" framing
  confidentiality: string;
  bookCta: string;
  /** Scope-boundary heading on the services page ("this consultation does not…"). */
  notIncludedLabel: string;
  /** Heading above the decision-moment line on a service card. */
  decisionMomentLabel: string;
  stickyCall: string; // short label for the mobile sticky bar
  stickyLine: string; // short LINE label for the mobile sticky bar
  recommendedLabel: string; // badge on the entry "first step" offers, cuts choice overload
  freeHeroCta: string; // strong, outcome-led label for the free-call hero button
  freeReassure: string; // micro-reassurance under the free-call button (free · no pitch)
  freeAgenda: string; // "what happens in the 30 min" no-pitch block (newline-separated)
  paidDivider: string; // soft divider before the (demoted) paid options
  founderLine: string; // founder credibility shown right at the free-call CTA
  replyPrompt: string; // low-friction alternative: "just reply with one question"
  replyCta: string; // the clickable reply link label
  replyEmail: string; // founder email for the one-line reply mailto
  // Compact CTA card shown INSIDE the report (after the second section) — 30 days of
  // data showed zero booking clicks on the bottom-of-page CTA, so placement is on trial.
  inlineCta: { line: string; bookCta: string; replyCta: string };
  offers: Record<OfferId, OfferCopy>;
}

export interface ConsentContent {
  processing: { label: string; detail: string };
  aggregate: { label: string };
  redactHint: string;
  /** Named the moment before upload: a human reads this, not only a model. */
  whoSeesIt: string;
  noAccessNote: string;
  retentionSummary: string;
  privacyLinkLabel: string;
}

export interface SeoContent {
  siteName: string;
  titles: { home: string; mri: string; privacy: string; result: string };
  descriptions: { home: string; mri: string; privacy: string };
  ogLocale: string;
}

export interface ErrorsContent {
  tooShort: string;
  fileMissing: string; // cv_pdf tab submit with no file chosen (walkthrough F3)
  tooLong: string;
  fileTooLarge: string;
  fileType: string;
  consentRequired: string;
  emailInvalid: string;
  extractionFailed: string;
  reportDegraded: string;
  rateLimited: string;
  dailyCapReached: string;
  notFound: string;
  generic: string;
  retry: string;
}

export interface EmailTemplate {
  subject: string;
  body: string; // {{name}}, {{report_url}}, {{personal_line}}, {{category_note}} placeholders
}
export interface EmailsContent {
  d0: EmailTemplate;
  d2: EmailTemplate;
  d6: EmailTemplate;
  /** Outcome loop (docs/outcome-loop-design-2026-07-21.md), sent d+30/d+90 after a
   * booked consult. Placeholders: {{name}}, {{focus_area}}, {{unsubscribe_url}}. */
  outcomeD30: EmailTemplate;
  outcomeD90: EmailTemplate;
  /**
   * "How the money actually works" note. Written 2026-08-08 after the conversion
   * audit found that 18 of 18 recommendations pulled on the top of the funnel and
   * none touched email — while the people who already left an address and read
   * their report are the highest-intent list the business has.
   *
   * DELIVERY IS DELIBERATELY UNWIRED. No scheduler, no send path, no API route
   * references this template. It is copy on disk until Michael himself decides to
   * send it. See docs/mechanics-email-2026-08-08.md.
   *
   * Placeholders: {{name}}, {{report_url}}, {{booking_url}}.
   */
  mechanics: EmailTemplate;
}

export interface PrivacyPageContent {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
  contactLine: string; // {{email}} placeholder
}

/** Copy for the public sample-report page and the links that point to it. */
export interface SampleContent {
  pageEyebrow: string;
  pageTitle: string;
  pageIntro: string;
  startCta: string;
  landingLinkLabel: string;
  emailGateLinkLabel: string;
}

/** A face-giving, shareable archetype per result category. */
export interface CareerTypeCard {
  label: string; // positive archetype shown on the card
  shareLine: string; // one-line shareable text; the site URL is appended
}
export interface ShareContent {
  heading: string;
  shareButton: string;
  copied: string;
  softCta: string;
  screenshotHint: string;
  types: Record<ResultCategory, CareerTypeCard>;
}

/** Everything a locale must provide. */
/** Career Digital Twin (v1): magic-link report timeline + band diff. Invite/paid only. */
export type TwinBandKey =
  | 'story_index'
  | 'mba_index'
  | 'climate_index'
  | 'commercial_credibility'
  | 'international_positioning'
  | 'interview_readiness'
  | 'cv_readiness'
  | 'green_economy_fit'
  | 'mba_readiness';
export interface TwinContent {
  request: {
    title: string;
    intro: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitCta: string;
    sentNote: string; // generic — never confirms whether the email is on the list
    inviteNote: string;
    invalidEmail: string;
  };
  hub: {
    title: string;
    intro: string;
    latestLabel: string;
    reportCta: string;
    diffTitle: string;
    diffIntro: string;
    needTwo: string;
    upWord: string;
    downWord: string;
    sameSummary: string; // contains {n}
    unknownWord: string;
    updateTitle: string;
    updateBody: string;
    updateCta: string;
    expiredTitle: string;
    expiredBody: string;
    requestAgainCta: string;
  };
  bandNames: Record<TwinBandKey, string>;
  resultLink: { prompt: string; cta: string };
}

/**
 * 綠領判斷力 (/[locale]/judgment) — chrome only. The competency graph, the 26
 * explainers and the 12 reps live in `content/judgment/data.json` and are
 * zh-TW originals; per rule 10 they are never machine-translated, so the `en`
 * locale gets English chrome plus an honest notice (`zhOnlyNotice`).
 */
export interface JudgmentContent {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lede: string;
  backLink: string;
  /** Rendered only where the module's content is not in the reader's locale. */
  zhOnlyNotice: { body: string; cta: string } | null;
  beta: { tag: string; body: string; mailSubject: string };
  tabs: { start: string; gaps: string; reps: string; map: string };
  bandLead: string; // contains {band}
  bandNone: string;
  start: {
    backgroundTitle: string;
    backgroundHint: string;
    backgrounds: Record<BackgroundKey, { label: string; hint: string }>;
    domainTitle: string;
    domainHint: string;
    cta: string;
    ctaBlocked: string;
  };
  gaps: {
    needBackground: string;
    stateTitle: string;
    stateNote: string;
    weakSignalNote: string; // appended to a low-confidence basis
    backgroundBasis: string; // contains {label}
    haveTitle: string;
    maybeTitle: string;
    maybeHint: string;
    gapTitle: string;
    gapRule: string;
    basisLabel: string;
    financeTag: string;
    sustainabilityTag: string;
    whyPaysLabel: string;
    timeLabel: string;
    explainerSummary: string;
    explainerPending: string;
    /**
     * When the regulations and figures in a three-minute explainer were last
     * checked. Contains {date}, filled from `explainers[id].meta.as_of`.
     *
     * The data has carried this date since the corpus was written and the UI
     * never rendered it, so 26 explainers full of hard regulatory detail (金管會
     * 公告日, 第一階段 170 家, 每年 8/31 前申報) read as permanently correct. A
     * reader acting on a superseded rule had no way to know it was superseded.
     */
    explainerAsOf: string;
    /**
     * Shown on competencies the corpus itself marks `volatile`. Contains {date}
     * from the competency's own `as_of`, which can be newer than its explainer's.
     */
    volatileAsOf: string;
    repsAttached: string; // contains {n}
    moreLabel: string; // contains {n}
    cta: string;
  };
  reps: {
    title: string;
    rule: string;
    /**
     * Freshness of the regulations and figures a drill is built on, shown with
     * the question rather than buried in the sources at the end. Contains {date},
     * derived from the OLDEST `as_of` across the drill's own sources.
     */
    asOf: string;
    stateTitle: string;
    /** Local-only storage disclosure — shown wherever progress is written. */
    storageNote: string;
    backToList: string;
    /** Only rendered when the drill was opened from a map tile: the CTA is a
     * one-way door without it. */
    backToMap: string;
    start: string;
    again: string;
    answeredPending: string;
    answeredWith: string; // contains {key}
    minutes: string; // contains {n}
    gate: { title: string; hint: string; placeholder: string; submit: string; skip: string };
    reveal: {
      choiceLine: string; // contains {key}
      bestIs: string; // contains {key}
      yourReasonLabel: string;
      skippedLabel: string;
      addReasonPlaceholder: string;
      takeawayLabel: string;
      reasoningTitle: string;
      breakdownSummary: string;
      temptingLabel: string;
      failureTitle: string;
      sourcesLabel: string;
      checkedOn: string; // contains {date}
    };
    verdicts: Record<Verdict, string>;
    empty: string;
  };
  map: {
    title: string;
    intro: string;
    legendTitle: string;
    legendBody: string; // contains {n}
    depthLabel: string;
    /** One label per prerequisite depth in the graph (0–3). The map stacks one
     * band per depth, so a missing label leaves a band unheaded. */
    depths: [string, string, string, string];
    statuses: { have: string; maybe: string; gap: string };
    /** How many competencies sit in a band. Contains {n}. */
    tierCount: string;
    /** Tile hint when a competency has no prerequisites at all. */
    readyNow: string;
    /** Tile hint naming the first prerequisite. Contains {name}. */
    needFirst: string;
    /** Tile hint when the reader's self-assessment already covers every
     * prerequisite. Only ever shown once a background is picked. */
    prereqsMet: string;
    /** How many competencies list this one as a prerequisite. Contains {n}. */
    unlocks: string;
    /** Heading above the prerequisite chips inside an opened tile. */
    prereqTitle: string;
    /** Link from a map tile down to the full card in the family list. */
    openCard: string;
    /** States the map's one rule, so vertical position is not read as
     * difficulty or importance. */
    cartographicNote: string;
    /** The drawn overview panel: all 26 stations and all 26 prerequisite edges,
     * deliberately without node text — 26 sentences of 9 to 33 characters cannot
     * share a viewport with a drawn topology, so the words live in the rail. */
    overviewTitle: string;
    overviewHint: string;
    /** Legend. A hub is any competency something else depends on (10 of 26); a
     * terminus is one nothing depends on (16 of 26). */
    legendHub: string;
    legendTerminus: string;
    legendFinance: string;
    isolatedNote: string;
    /** The five competencies with no prerequisites at all. */
    startTitle: string;
    opensN: string; // contains {n}
    opensNone: string;
    /** The route rail: what this one needs, then it, then what it opens. */
    routeTitle: string;
    routeCount: string; // contains {n}
    roleUp: string;
    roleFocus: string;
    roleDown: string;
  };
  exit: { title: string; body: string; betaNote: string; mailSubject: string };
  about: {
    summary: string;
    title: string;
    intro: string; // contains {competencies} {explainers} {reps}
    blocks: { heading: string; body: string }[];
    identityTitle: string;
    identityMail: string;
    honestTitle: string;
    honestPoints: string[];
  };
  footer: { origin: string; disclaimer: string };
}

export interface LocaleContent {
  sample: SampleContent;
  share: ShareContent;
  landing: LandingContent;
  flow: FlowContent;
  questions: QuestionsContent;
  results: ResultsContent;
  reportTemplates: ReportTemplatesContent;
  paidOffers: PaidOffersContent;
  consent: ConsentContent;
  seo: SeoContent;
  errors: ErrorsContent;
  emails: EmailsContent;
  privacyPage: PrivacyPageContent;
  twin: TwinContent;
  judgment: JudgmentContent;
}
