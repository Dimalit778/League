import { useLeagueStore } from '@/store/LeagueStore';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { primaryLeague } = useLeagueStore();

  return (
    <Stack>
      <Stack.Protected guard={!!primaryLeague}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
