import { TabsHeader } from '@/components/layout';
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
      <Stack.Screen name="join-league" options={{ headerShown: false }} />
      <Stack.Screen
        name="select-competition"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="create-league" options={{ headerShown: false }} />
      <Stack.Screen name="preview-league" options={{ headerShown: false }} />
    </Stack>
  );
}
