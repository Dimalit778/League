import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signUp" />
      <Stack.Screen name="signIn" />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
    </Stack>
  );
}
