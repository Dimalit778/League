import { useRequiresLeagueActivation } from '@/features/leagues/hooks/useRequiresLeagueActivation';
import { Redirect, Stack } from 'expo-router';

export default function LeagueLayout() {
  const requiresLeagueActivation = useRequiresLeagueActivation();

  if (requiresLeagueActivation) {
    return <Redirect href="/(app)/(user)/leagues/my-leagues" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match/[matchId]" />
      <Stack.Screen name="member/[memberId]" />
      <Stack.Screen name="edit-league" />
      <Stack.Screen name="report-content" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
