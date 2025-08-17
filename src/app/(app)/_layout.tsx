import { useAppStore } from "@/store/useAppStore";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { primaryLeague } = useAppStore();

  if (!primaryLeague) {
    return <Redirect href="/myLeagues" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
