import { BackButton } from '@/components/ui/BackButton';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signUp"
        options={{
          header: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          header: () => <BackButton />,
        }}
      />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
    </Stack>
  );
}
