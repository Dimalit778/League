import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export default function AppLayout() {
  const { member, initializeMemberLeagues, isLoading } = useMemberStore();

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

    // Monitor app state for re-sync when app comes to foreground
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Re-sync MemberStore when app comes to foreground
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!member}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="match" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
    </Stack>
  );
}
