import { Stack } from 'expo-router';

export default function LeaguesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="my-leagues">
      <Stack.Screen name="my-leagues" />
      <Stack.Screen name="join-league" />
      <Stack.Screen name="create-league" />
    </Stack>
  );
}
