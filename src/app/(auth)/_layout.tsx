import { SplashScreen } from '@/components/layout';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

export default function AuthLayout() {
  const { session, loading } = useCurrentSession();

  if (loading) {
    return <SplashScreen />;
  }

  if (session?.user) {
    return <Redirect href="/(app)/(tabs)/League" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signIn" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
        <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}
