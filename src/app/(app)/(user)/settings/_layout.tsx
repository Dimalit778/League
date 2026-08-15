import { NavigationHeader } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SettingsLayout() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        fullScreenGestureEnabled: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => <NavigationHeader title={t('Settings')} fallbackHref="/(app)/(league)/(tabs)/Profile" />,
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          header: () => <NavigationHeader title={t('Privacy Policy')} fallbackHref="/(app)/(user)/settings" />,
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          header: () => <NavigationHeader title={t('Terms')} fallbackHref="/(app)/(user)/settings" />,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          header: () => <NavigationHeader title={t('Help & Support')} fallbackHref="/(app)/(user)/settings" />,
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          header: () => <NavigationHeader title={t('Subscription')} fallbackHref="/(app)/(user)/settings" />,
        }}
      />
      <Stack.Screen
        name="blocked-users"
        options={{
          header: () => <NavigationHeader title={t('Blocked users')} fallbackHref="/(app)/(user)/settings" />,
        }}
      />
    </Stack>
  );
}
