import { TopBar } from "@/components/ui";
import { Stack } from "expo-router";

export default function NewLeagueLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <TopBar showBackButton />,
      }}
    >
      <Stack.Screen
        name="join-league"
        options={{
          header: () => <TopBar title="Join League" showBackButton />,
        }}
      />
      <Stack.Screen
        name="select-competition"
        options={{ headerShown: true, title: "Select Competition" }}
      />
      <Stack.Screen
        name="league-details"
        options={{ headerShown: true, title: "League Details" }}
      />
      <Stack.Screen
        name="league-created"
        options={{ headerShown: true, title: "League Created" }}
      />
    </Stack>
  );
}
