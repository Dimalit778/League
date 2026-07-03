import { Stack } from 'expo-router';

export default function LeaguesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="join-league" />
      <Stack.Screen name="create-league" />
    </Stack>
  );
}
