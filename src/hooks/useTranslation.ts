import { translateRaw } from '@/lib/i18n/translate';
import { translations } from '@/lib/i18n/translations';
import { SupportedLanguage, useLanguageStore } from '@/store/LanguageStore';
export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const translate = (key: string, variables?: Record<string, string | number>) =>
    translateRaw(language, key, variables);
  return {
    t: translate,
    language,
    setLanguage,
    toggleLanguage,
    availableLanguages: Object.keys(translations) as SupportedLanguage[],
  };
};
