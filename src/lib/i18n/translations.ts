import { en } from '@/lib/i18n/locales/en';
import { he } from '@/lib/i18n/locales/he';
import type { SupportedLanguage } from '@/store/LanguageStore';

export type TranslationDictionary = Record<string, string>;

// Feature names organise the locale files for maintainers. Runtime lookup stays
// flat for backward compatibility with existing calls such as t('Sign In').
function flattenTranslations(obj: Record<string, unknown>): TranslationDictionary {
  const result: TranslationDictionary = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value as Record<string, unknown>));
    } else if (typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: flattenTranslations(en),
  he: flattenTranslations(he),
};
