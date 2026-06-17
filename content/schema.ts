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
  footer: { privacyLink: string; deleteLine: string; rightsLine: string };
}

export interface FlowContent {
  stepIndicator: { input: string; confirm: string; questions: string };
  intro: { title: string; body: string };
  inputTabs: Record<InputType, { tab: string; hint: string; placeholder?: string }>;
  pdf: { dropLabel: string; chooseFile: string; selected: string; remove: string };
  submit: string;
  charCount: string; // "{count} characters"
  progress: {
    extraction: { title: string; stages: string[] };
    report: { title: string; stages: string[] };
  };
  confirmation: {
    title: string;
    intro: string;
    identityLabel: string;
    careerLabel: string;
    sectorsLabel: string;
    domainsLabel: string;
    intentLabel: string;
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
  sections: Record<ReportSectionKey, { title: string; fallback: string }>;
  footer: { deleteLine: string; confidentiality: string; returnNote: string };
}

export interface OfferCopy {
  name: string;
  price: string; // display string, placeholder prices
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
  creditPolicy: string;
  confidentiality: string;
  bookCta: string;
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

/** Honest, deadline-bound promotion. Auto-hidden past NEXT_PUBLIC_PROMO_DEADLINE. */
export interface PromoContent {
  eyebrow: string; // short label, e.g. "Beta founding cohort"
  headline: string; // the offer + the real date
  note: string; // honest fine print — no fake scarcity
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
  types: Record<ResultCategory, CareerTypeCard>;
}

/** Everything a locale must provide. */
export interface LocaleContent {
  promo: PromoContent;
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
