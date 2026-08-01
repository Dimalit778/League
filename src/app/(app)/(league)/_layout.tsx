import { Stack } from 'expo-router';

export default function LeagueLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match/[matchId]" />
      <Stack.Screen name="member/[memberId]" />
      <Stack.Screen name="edit-league" />
    </Stack>
  );
}
