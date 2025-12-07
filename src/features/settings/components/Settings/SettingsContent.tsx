import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useThemeStore } from '@/store/ThemeStore';
import { Tables } from '@/types/database.types';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RelativePathString, useRouter } from 'expo-router';
import { TouchableWithoutFeedback, View } from 'react-native';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';

const SettingsContent = ({
  created_at = 'N/A',
  subscription,
  email,
}: {
  created_at?: string;
  subscription: Tables<'subscription'> | undefined;
  email?: string;
}) => {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const ArrowIcon = isRTL ? 'left' : 'right';
  const createdAtDateString = new Date(created_at).toLocaleDateString();
  const subscriptionType = subscription?.subscription_type || t('Free');

  const renderAccountActions = (title: string, path?: RelativePathString) => {
    const handlePress = () => {
      if (path) {
        router.push(path);
      }
    };

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <CText className="text-text text-base ">{title}</CText>
          <AntDesign name={ArrowIcon} size={16} color={theme === 'dark' ? 'white' : 'black'} />
        </View>
      </TouchableWithoutFeedback>
    );
  };
  return (
    <>
      {/* Profile Information */}
      <View className="border-b border-primary">
        {/* Theme Toggle */}
        <View className="border-t border-b border-border py-3 px-4 flex-row justify-between items-center">
          <CText className="text-text text-base">{t('Theme')}</CText>
          <ThemeToggle />
        </View>
        {/* Language Toggle */}
        <View className="border-t border-b border-border py-3 px-4 flex-row justify-between items-center">
          <CText className="text-text text-base">{t('Language')}</CText>
          <LanguageToggle />
        </View>
        {/* Subscription */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <CText className="text-text text-base">{t('Subscription')}</CText>

          <CText className="text-primary text-sm font-medium ">{subscriptionType}</CText>
        </View>
        {/* Email */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <CText className="text-text text-base ">{t('Email')}</CText>
          <CText className="text-text text-base">{email}</CText>
        </View>
        {/* Joined On */}
        <View className="border-t border-b border-border py-4 px-4 flex-row justify-between items-center">
          <CText className="text-text text-base ">{t('Joined On')}</CText>
          <CText className="text-text text-base">{createdAtDateString}</CText>
        </View>
      </View>

      <View>
        {renderAccountActions(t('Subscription'), '/(app)/subscription' as RelativePathString)}

        {renderAccountActions(t('Privacy Settings'), '/settings/privacy' as RelativePathString)}

        {renderAccountActions(t('Help & Support'), '/settings/help' as RelativePathString)}
      </View>
    </>
  );
};

export default SettingsContent;
