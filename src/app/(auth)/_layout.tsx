import { SplashScreen } from '@/components/layout';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { session, loading } = useCurrentSession();

  if (loading) {
    return <SplashScreen />;
  }

  if (session?.user) {
    return <Redirect href="/(app)/(tabs)/League" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signUp" />
      <Stack.Screen name="signIn" />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
    </Stack>
  );
}
