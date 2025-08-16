import { TopBar } from "@/shared/components/layout";
import { Stack } from "expo-router";

export default function LeaguesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Leagues",
          header: () => <TopBar title="Leagues" />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: "pageSheet",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="join-league"
        options={{
          title: "Join League",
          header: () => <TopBar title="Join League" showBackButton />,
        }}
      />
      <Stack.Screen
        name="createLeague/newLeague-competitions"
        options={{
          title: "Create League",
          header: () => <TopBar title="Create League" showBackButton />,
        }}
      />
      <Stack.Screen
        name="createLeague/newLeague-details"
        options={{
          title: "League Details",
          header: () => <TopBar title="League Details" showBackButton />,
        }}
      />
      <Stack.Screen
        name="createLeague/newLeague-preview"
        options={{
          title: "League Created",
          header: () => <TopBar title="League Created" />,
        }}
      />
    </Stack>
  );
}
