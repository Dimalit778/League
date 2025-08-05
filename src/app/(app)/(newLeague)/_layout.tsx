import { Stack } from "expo-router";

export default function NewLeagueLayout() {
  return (
    <Stack>
      {/* Screen for joining an existing league */}
      <Stack.Screen
        name="join-league"
        options={{ headerShown: true, title: "Join League" }}
      />
      {/* Screen for selecting a competition */}
      <Stack.Screen
        name="select-competition"
        options={{ headerShown: true, title: "Select Competition" }}
      />
      {/* Screen for entering league details (name, nickname, members) */}
      <Stack.Screen
        name="league-details"
        options={{ headerShown: true, title: "League Details" }}
      />
      {/* Screen displayed after successful league creation */}
      <Stack.Screen
        name="league-created"
        options={{ headerShown: true, title: "League Created" }}
      />
    </Stack>
  );
}
