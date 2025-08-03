import { Stack } from "expo-router";

export default function NewLeagueLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="join-league"
        options={{ headerShown: true, title: "Join League" }}
      />
      <Stack.Screen
        name="create-league"
        options={{ headerShown: true, title: "Create League" }}
      />
      <Stack.Screen
        name="league-preview"
        options={{ headerShown: true, title: "League Preview" }}
      />
    </Stack>
  );
}
