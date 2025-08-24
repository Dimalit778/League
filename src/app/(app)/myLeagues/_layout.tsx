import { SafeAreaWrapper, TopBar } from '@/components/layout';
import { BackButton } from '@/components/ui/BackButton';
import { Stack } from 'expo-router';

export default function NewLeagueLayout() {
  return (
    <SafeAreaWrapper>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <BackButton />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: true, header: () => <TopBar /> }}
        />
        <Stack.Screen name="join-league" />
        <Stack.Screen name="select-competition" />
        <Stack.Screen name="league-details" />
        <Stack.Screen name="league-created" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaWrapper>
  );
}
