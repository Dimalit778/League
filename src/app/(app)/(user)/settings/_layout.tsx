import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, router } from 'expo-router';

export default function SettingsLayout() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,

        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        fullScreenGestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('Settings'),
          headerLeft: () => <HeaderBackButton tintColor={colors.text} onPress={() => router.back()} />,
        }}
      />
      <Stack.Screen name="privacy" options={{ title: t('Privacy') }} />
      <Stack.Screen name="terms" options={{ title: t('Terms') }} />
      <Stack.Screen name="help" options={{ title: t('Help') }} />
      <Stack.Screen name="subscription" options={{ title: t('Subscription') }} />
      <Stack.Screen name="blocked-users" options={{ title: t('Blocked users') }} />
    </Stack>
  );
}
