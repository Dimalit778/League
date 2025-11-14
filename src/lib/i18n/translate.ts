import { translations } from '@/lib/i18n/translations';
import { SupportedLanguage } from '@/store/LanguageStore';
const FALLBACK_LANGUAGE: SupportedLanguage = 'en';
export const formatTemplate = (template: string, variables?: Record<string, string | number>) => {
  if (!variables) {
    return template;
  }
  return Object.entries(variables).reduce((result, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return result.replace(regex, String(value));
  }, template);
};
export const translateRaw = (language: SupportedLanguage, key: string, variables?: Record<string, string | number>) => {
  const normalizedKey = key.replace(/\s+/g, ' ').trim();
  const activeDictionary = translations[language] ?? translations[FALLBACK_LANGUAGE];
  const fallbackDictionary = translations[FALLBACK_LANGUAGE];
  const template = activeDictionary[normalizedKey] ?? fallbackDictionary[normalizedKey];
  if (template !== undefined) {
    return formatTemplate(template, variables);
  }
  return formatTemplate(key, variables);
};
