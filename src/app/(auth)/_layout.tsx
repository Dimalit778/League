import { NavigationHeader } from '@/components/layout/NavigationHeader';
import PendingEmailVerificationRedirect from '@/features/auth/components/PendingEmailVerificationRedirect';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  return (
    <>
      <PendingEmailVerificationRedirect />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen
          name="signIn"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signUp"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen
          name="privacy"
          options={{
            headerShown: true,
            header: () => <NavigationHeader title={t('Privacy Policy')} fallbackHref="/(auth)" />,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            headerShown: true,
            header: () => <NavigationHeader title={t('Terms of Service')} fallbackHref="/(auth)" />,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="accessibility"
          options={{
            headerShown: true,
            header: () => <NavigationHeader title={t('Accessibility')} fallbackHref="/(auth)" />,
            gestureEnabled: true,
          }}
        />
      </Stack>
    </>
  );
}
