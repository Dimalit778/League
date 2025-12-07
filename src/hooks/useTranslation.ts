import { translateRaw } from '@/lib/i18n/translate';
import { translations } from '@/lib/i18n/translations';
import { useIsRTL, useLanguageContext } from '@/providers/LanguageProvider';
import { SupportedLanguage, useLanguageStore } from '@/store/LanguageStore';

export const useTranslation = () => {
  // Subscribe to language store for state management
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  // Also subscribe to language context to ensure re-renders
  const { version } = useLanguageContext();
  const isRTL = useIsRTL();

  const translate = (key: string, variables?: Record<string, string | number>) =>
    translateRaw(language, key, variables);

  return {
    t: translate,
    language,
    setLanguage,
    toggleLanguage,
    isRTL,
    availableLanguages: Object.keys(translations) as SupportedLanguage[],
  };
};
