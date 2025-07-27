import { Stack } from "expo-router";

export default function NewLeagueLayout() {
  return (
    <Stack>
      <Stack.Screen name="join-league" options={{ headerShown: true }} />
      <Stack.Screen name="create-league" options={{ headerShown: true }} />
    </Stack>
  );
}
