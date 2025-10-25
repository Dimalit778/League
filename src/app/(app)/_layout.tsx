import { useGetUser } from '@/hooks/useUsers';
import { useMemberStore } from '@/store/MemberStore';

import { Stack } from 'expo-router';

export default function AppLayout() {
  const member = useMemberStore((s) => s.member);
  const user = useGetUser();
  const admin = user?.data?.role === 'ADMIN';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!member}>
        <Stack.Screen name="(member)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!admin}>
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
    </Stack>
  );
}
