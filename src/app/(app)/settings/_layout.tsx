import { Stack, useRouter } from 'expo-router';

export default function SettingsLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="edit-user" options={{ headerShown: false }} />
    </Stack>
  );
}
