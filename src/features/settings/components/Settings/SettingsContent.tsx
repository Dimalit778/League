import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useThemeStore } from '@/store/ThemeStore';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RelativePathString, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';

const SettingsContent = ({
  created_at = 'N/A',
  subscriptionType,
  email,
}: {
  created_at?: string;
  subscriptionType?: string;
  email?: string;
}) => {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const ArrowIcon = isRTL ? 'left' : 'right';
  const createdAtDateString = new Date(created_at).toLocaleDateString();
  const displayType = subscriptionType || t('Free');

  const renderAccountActions = (title: string, path?: RelativePathString) => {
    const handlePress = () => {
      if (path) {
        router.push(path);
      }
    };

    return (
      <Pressable onPress={handlePress}>
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base ">{title}</Text>
          <AntDesign name={ArrowIcon} size={16} color={theme === 'dark' ? 'white' : 'black'} />
        </View>
      </Pressable>
    );
  };
  return (
    <>
      {/* Profile Information */}
      <View className="border-b border-primary">
        {/* Theme Toggle */}
        <View className="border-t border-b border-border py-3 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base">{t('Theme')}</Text>
          <ThemeToggle />
        </View>
        {/* Language Toggle */}
        <View className="border-t border-b border-border py-3 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base">{t('Language')}</Text>
          <LanguageToggle />
        </View>
        {/* Subscription */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base">{t('Subscription')}</Text>

          <Text className="text-primary text-sm font-medium ">{displayType}</Text>
        </View>
        {/* Email */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base ">{t('Email')}</Text>
          <Text className="text-text text-base">{email}</Text>
        </View>
        {/* Joined On */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <Text className="text-text text-base ">{t('Joined On')}</Text>
          <Text className="text-text text-base">{createdAtDateString}</Text>
        </View>
      </View>

      <View>
        {renderAccountActions(t('Subscription'), '/settings/subscription' as RelativePathString)}

        {renderAccountActions(t('Privacy Policy'), '/settings/privacy' as RelativePathString)}

        {renderAccountActions(t('Terms of Service'), '/settings/terms' as RelativePathString)}

        {renderAccountActions(t('Help & Support'), '/settings/help' as RelativePathString)}
      </View>
    </>
  );
};

export default SettingsContent;
