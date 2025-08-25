import { LoadingOverlay } from '@/components/layout';
import { useMemberStore } from '@/store/MemberStore';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const { initializeMembers, loading, member } = useMemberStore();

  useEffect(() => {
    initializeMembers();
  }, []);

  if (loading) return <LoadingOverlay />;

  return (
    <Stack>
      <Stack.Protected guard={!!member}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
