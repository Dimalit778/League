import { useAppStore } from "@/services/store/AppStore";
import { Stack } from "expo-router";

export default function AppLayout() {
  const { userLeagues } = useAppStore();

  console.log("AppLayout userLeagues  ", JSON.stringify(userLeagues, null, 2));
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(newLeague)" options={{ headerShown: false }} />
    </Stack>
  );
}
