import type { Locale } from '@/lib/constants';
import type { LocaleContent } from './schema';
import { en } from './en';
import { zhTW } from './zh-TW';

const registry: Record<Locale, LocaleContent> = { en, 'zh-TW': zhTW };

/** The only sanctioned way for components to read copy. */
export function getContent(locale: Locale): LocaleContent {
  return registry[locale];
}

/** One-line style note injected into locale-aware prompts (PROMPT_LIBRARY.md rule 4). */
export const LOCALE_STYLE_NOTES: Record<Locale, string> = {
  en: 'Write in clear, direct, consultant-grade English. Warm but never gushing. No exclamation marks, no emoji, no hype words.',
  'zh-TW':
    '以台灣專業商業顧問的繁體中文書寫：冷靜、具體、可信。使用全形標點（，。：），中英文與數字之間加半形空格（例：在 ESG 領域 7 年）。避免「保證」「秒懂」「爆款」等行銷腔，不用驚嘆號與表情符號。語氣對讀者稱「你」。',
};
