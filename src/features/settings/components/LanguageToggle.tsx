import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { TouchableOpacity, View } from 'react-native';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useTranslation();
  const isHebrew = language === 'he';

  const handlePress = () => {
    toggleLanguage();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-subtle relative flex-row rounded-full items-center justify-between p-0.5"
        accessible={true}
        accessibilityLabel={t('Switch to {{language}}', {
          language: isHebrew ? 'English' : 'Hebrew',
        })}
        accessibilityRole="switch"
        accessibilityState={{ checked: isHebrew }}
      >
        <View className="w-9 h-9 items-center justify-center">
          <Text>EN</Text>
        </View>
        <View className="w-9 h-9 items-center justify-center">
          <Text>עב</Text>
        </View>
        <View
          className={`absolute w-9 h-9 bg-text rounded-full items-center justify-center ${
            isHebrew ? 'right-1' : 'left-1'
          }`}
        >
          <Text className="font-bold text-background">
            {isHebrew ? 'עב' : 'EN'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageToggle;
