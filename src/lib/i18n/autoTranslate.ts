import { translateRaw } from '@/lib/i18n/translate';
import { SupportedLanguage, useLanguageStore } from '@/store/LanguageStore';
import { Alert } from 'react-native';

const getCurrentLanguage = (): SupportedLanguage => {
  return useLanguageStore.getState().language;
};

const originalAlert = Alert.alert;
Alert.alert = function translatedAlert(
  title: string,
  message?: string,
  buttons?: Parameters<typeof Alert.alert>[2],
  options?: Parameters<typeof Alert.alert>[3]
) {
  const currentLanguage = getCurrentLanguage();
  const translatedTitle = translateRaw(currentLanguage, title);
  const translatedMessage = message !== undefined ? translateRaw(currentLanguage, message) : message;
  const translatedButtons = buttons?.map((button) => {
    if (!button?.text) {
      return button;
    }
    return {
      ...button,
      text: translateRaw(currentLanguage, button.text),
    };
  });
  return originalAlert(translatedTitle, translatedMessage, translatedButtons, options);
};
