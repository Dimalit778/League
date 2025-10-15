import { useGetUser } from '@/hooks/useUsers';
import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export default function AppLayout() {
  const { member, initializeMemberLeagues, isLoading } = useMemberStore();
  const user = useGetUser();

  useEffect(() => {
    const initializeIfAuthenticated = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await initializeMemberLeagues();
      }
    };
    initializeIfAuthenticated();
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await initializeMemberLeagues();
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  if (isLoading) return null;

  const admin = user.data?.role === 'ADMIN';

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
