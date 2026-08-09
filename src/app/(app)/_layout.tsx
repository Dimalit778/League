import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useAuth } from '@/providers/AuthProvider';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const memberId = usePrimaryLeagueStore((s) => s.memberId);
  const leagueId = usePrimaryLeagueStore((s) => s.leagueId);
  const competitionId = usePrimaryLeagueStore((s) => s.competitionId);

  const hasPrimaryLeague = !!leagueId && !!competitionId && !!memberId;

  const loading = usePrimaryLeagueStore((s) => s.loading);
  const initializePrimaryLeague = usePrimaryLeagueStore((s) => s.initializePrimaryLeague);
  const { data: isAdminUser } = useIsAdmin();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      void initializePrimaryLeague();
    }
  }, [isAuthLoading, isLoggedIn, initializePrimaryLeague]);

  if (isAuthLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={'#fff'} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={hasPrimaryLeague}>
        <Stack.Screen name="(league)" />
      </Stack.Protected>
      <Stack.Screen name="(user)" />

      <Stack.Protected guard={!!isAdminUser}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
    </Stack>
  );
}
