import { SplashScreen } from '@/components/layout';
import { useCurrentSession } from '@/features/auth/hooks/useCurrentSession';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { session, isLoading } = useCurrentSession();
  const { colors } = useThemeTokens();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="verifyEmail" options={{ headerShown: false }} />
      <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
      <Stack.Screen name="sendResetLink" options={{ headerShown: false }} />
    </Stack>
  );
}
