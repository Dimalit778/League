import { BackButton } from '@/components/ui/BackButton';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: true, header: () => <BackButton /> }}
      />
    </Stack>
  );
}
