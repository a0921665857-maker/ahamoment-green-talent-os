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
  price: string; // current (possibly early-bird) display price
  originalPrice?: string; // strike-through pre-discount price when on early-bird
  priceNote?: string; // e.g. hybrid "base + success bonus" note under the price
  delivery: string;
  forWhom: string;
  blurb: string;
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
  guarantee: string; // satisfaction/risk-reversal guarantee shown near the offers
  creditPolicy: string;
  confidentiality: string;
  bookCta: string;
  payCta?: string; // direct-payment CTA label, used when a Stripe payment link is configured for an offer
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
  inlineCta: { line: string; bookCta: string; replyCta: string; lineCta: string };
  offers: Record<OfferId, OfferCopy>;
}

export interface ConsentContent {
  processing: { label: string; detail: string };
  aggregate: { label: string };
  redactHint: string;
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
}
