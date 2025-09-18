import { Screen } from '@/components/layout';
import { Stack } from 'expo-router';

export default function NewLeagueLayout() {
  return (
    <Screen>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="join-league" />
        <Stack.Screen name="select-competition" />
        <Stack.Screen name="create-league" />
        <Stack.Screen name="preview-league" />
      </Stack>
    </Screen>
  );
}
