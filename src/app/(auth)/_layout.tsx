import PendingEmailVerificationRedirect from '@/features/auth/components/PendingEmailVerificationRedirect';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { colors } = useThemeTokens();

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
        <Stack.Screen name="signIn" />
        <Stack.Screen name="signUp" />
        <Stack.Screen name="verifyEmail" />
        <Stack.Screen name="resetPassword" />
        <Stack.Screen name="sendResetLink" />
        <Stack.Screen name="privacy" options={{ gestureEnabled: true }} />
        <Stack.Screen name="terms" options={{ gestureEnabled: true }} />
      </Stack>
    </>
  );
}
