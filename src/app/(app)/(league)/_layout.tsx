import { useRequiresLeagueActivation } from '@/features/leagues/hooks/useRequiresLeagueActivation';
import { Redirect, Stack } from 'expo-router';

export default function LeagueLayout() {
  // Cold start goes straight from auth into the primary league's tabs,
  // never passing through My Leagues — so a league that's become
  // ineligible for the user's current plan (e.g. downgraded while it was
  // their only active league) would otherwise never be caught. Route to
  // My Leagues instead, where the "choose active leagues" picker resolves it.
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
