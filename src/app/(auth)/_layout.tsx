import { SplashScreen } from '@/components/layout';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const { session, isLoading } = useCurrentSession();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (session?.user) {
    return <Redirect href="/(app)/(member)/(tabs)/League" />;
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
