import TopBar from '@/components/layout/TopBar';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signUp"
        options={{
          header: () => <TopBar showTitle showBackButton />,
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          header: () => <TopBar showTitle showBackButton />,
        }}
      />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
    </Stack>
  );
}
