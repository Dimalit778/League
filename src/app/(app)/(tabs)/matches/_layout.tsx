import { TopBar } from "@/shared/components/layout";
import { Stack } from "expo-router";

export default function LeaguesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Matches",
          header: () => <TopBar title="Matches" />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Match Details" }}
      />
    </Stack>
  );
}
