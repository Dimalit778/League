import { useMemberStore } from '@/store/MemberStore';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { member } = useMemberStore();

  return (
    <Stack>
      <Stack.Protected guard={!!member}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
    </Stack>
  );
}
