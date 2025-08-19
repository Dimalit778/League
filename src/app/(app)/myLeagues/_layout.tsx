import TopBar from '@/components/layout/TopBar';
import { Stack } from 'expo-router';

export default function NewLeagueLayout() {
  return (
    <>
      <TopBar showBackButton />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="join-league" options={{ headerShown: false }} />
        <Stack.Screen
          name="select-competition"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="league-details" options={{ headerShown: false }} />
        <Stack.Screen name="league-created" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
