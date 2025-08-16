import { Stack } from "expo-router";

export default function AppLayout() {
  // const { data: leagues, isLoading } = useMyLeagues();
  // console.log(leagues);
  // if (isLoading) return <Loading />;
  // if (leagues?.length === 0) return <Redirect href="/myLeagues" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
