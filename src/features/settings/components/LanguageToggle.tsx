import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { TouchableOpacity, View } from 'react-native';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useTranslation();
  const isHebrew = language === 'he';

  const handlePress = () => {
    toggleLanguage();
  };

  return (
    <View pointerEvents="box-only">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="bg-secondary relative flex-row rounded-full items-center justify-between p-1"
        accessible={true}
        accessibilityLabel={t('Switch to {{language}}', {
          language: isHebrew ? 'English' : 'Hebrew',
        })}
        accessibilityRole="switch"
        accessibilityState={{ checked: isHebrew }}
      >
        <View className="w-10 h-8 items-center justify-center">
          <CText className="text-text text-xs font-medium">EN</CText>
        </View>
        <View className="w-10 h-8 items-center justify-center">
          <CText className="text-text text-xs font-medium">עב</CText>
        </View>
        <View
          className={`absolute w-10 h-8 bg-background rounded-full items-center justify-center ${
            isHebrew ? 'right-1' : 'left-1'
          }`}
        >
          <CText className="text-text text-xs font-semibold">{isHebrew ? 'עב' : 'EN'}</CText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageToggle;
