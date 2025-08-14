import { TopBar } from "@/shared/components/layout";
import { Stack } from "expo-router";

export default function LeaguesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Predictions",
          header: () => <TopBar title="Predictions" />,
        }}
      />
      <Stack.Screen
        name="my-predictions"
        options={{ headerShown: true, title: "My Predictions" }}
      />
    </Stack>
  );
}
