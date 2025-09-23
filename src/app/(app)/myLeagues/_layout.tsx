import { TabsHeader } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { Stack } from 'expo-router';

export default function MyLeaguesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <TabsHeader showLeagueName={false} />,
        }}
      />
      <Stack.Screen
        name="join-league"
        options={{ headerShown: true, header: () => <BackButton /> }}
      />
      <Stack.Screen
        name="select-competition"
        options={{ headerShown: true, header: () => <BackButton /> }}
      />
      <Stack.Screen
        name="create-league"
        options={{ headerShown: true, header: () => <BackButton /> }}
      />
      <Stack.Screen name="preview-league" />
    </Stack>
  );
}
