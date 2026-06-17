import type { LocaleContent } from '../schema';
import { promo } from './promo';
import { sample } from './sample';
import { share } from './share';
import { landing } from './landing';
import { flow } from './flow';
import { questions } from './questions';
import { results } from './results';
import { reportTemplates } from './reportTemplates';
import { paidOffers } from './paidOffers';
import { consent } from './consent';
import { seo } from './seo';
import { errors } from './errors';
import { emails } from './emails';
import { privacyPage } from './privacy';

export const en: LocaleContent = {
  promo, sample, share, landing, flow, questions, results, reportTemplates,
  paidOffers, consent, seo, errors, emails, privacyPage,
};
