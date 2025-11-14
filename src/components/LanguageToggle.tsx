import { useTranslation } from '@/hooks/useTranslation';
import { Pressable, Text } from 'react-native';
const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useTranslation();
  const nextLanguageLabel = language === 'en' ? t('Hebrew') : t('English');
  const currentLanguageLabel = language === 'en' ? t('English') : t('Hebrew');
  return (
    <Pressable
      onPress={toggleLanguage}
      className="px-4 py-2 rounded-full border border-border bg-background"
      accessibilityRole="button"
      accessibilityLabel={t('Switch to {{language}}', {
        language: nextLanguageLabel,
      })}
    >
      <Text className="text-text text-sm font-medium">
        {t('Language: {{language}}', { language: currentLanguageLabel })}
      </Text>
      <Text className="text-muted text-xs text-center mt-1">
        {t('Tap to switch to {{language}}', { language: nextLanguageLabel })}
      </Text>
    </Pressable>
  );
};
export default LanguageToggle;
