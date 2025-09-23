import { BackButton } from '@/components/ui';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: true, header: () => <BackButton /> }}
      />
    </Stack>
  );
}
