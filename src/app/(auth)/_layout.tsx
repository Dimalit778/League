import { SplashScreen } from '@/components/layout';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { session, isLoading } = useCurrentSession();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (session?.user) {
    return <Redirect href="/(app)/(public)/myLeagues" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
    </Stack>
  );
}
