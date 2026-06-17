import { LOCALES, type Locale } from '@/lib/constants';

export interface LocaleMeta {
  code: Locale;
  label: string;     // shown in the switcher, written in its own language
  htmlLang: string;  // value for <html lang>
  hreflang: string;
}

export const localeRegistry: LocaleMeta[] = [
  { code: 'en', label: 'English', htmlLang: 'en', hreflang: 'en' },
  { code: 'zh-TW', label: '繁體中文', htmlLang: 'zh-Hant-TW', hreflang: 'zh-Hant' },
];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
