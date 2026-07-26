import { Stack } from 'expo-router';

export default function LeagueLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="match/[matchId]"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen name="member/[memberId]" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
