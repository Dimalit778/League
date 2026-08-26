import { LoadingBall } from '@/components';
import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { SUBSCRIPTIONS_ENABLED } from '@/features/subscription/subscriptionMode';
import { useAuth } from '@/providers/AuthProvider';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function AppLayout() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const memberId = usePrimaryLeagueStore((s) => s.memberId);
  const leagueId = usePrimaryLeagueStore((s) => s.leagueId);
  const competitionId = usePrimaryLeagueStore((s) => s.competitionId);

  const hasPrimaryLeague = !!leagueId && !!competitionId && !!memberId;

  const loading = usePrimaryLeagueStore((s) => s.loading);
  const initializePrimaryLeague = usePrimaryLeagueStore((s) => s.initializePrimaryLeague);
  // Admin status only guards the `admin` screen below, so it must NOT block
  // startup. Resolving it in the background (defaulting to non-admin) keeps the
  // `is_admin` network call off the critical path — otherwise every launch,
  // even a warm one with a persisted primary league, waits on it behind a
  // full-screen spinner.
  const { data: isAdminUser = false, error: adminError } = useIsAdmin();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      void initializePrimaryLeague();
    }
  }, [isAuthLoading, isLoggedIn, initializePrimaryLeague]);

  useEffect(() => {
    if (adminError) {
      console.error('Failed to verify admin access:', adminError);
    }
  }, [adminError]);

  if (isAuthLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <LoadingBall />
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
        <Stack.Screen
          name="(league)"
          options={{
            gestureEnabled: false,
            fullScreenGestureEnabled: false,
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="(user)"
        options={{
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
      />

      <Stack.Protected guard={SUBSCRIPTIONS_ENABLED}>
        <Stack.Screen
          name="(paywall)/index"
          options={{
            presentation: 'formSheet',

            animation: 'slide_from_bottom',
            gestureEnabled: false,
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!isAdminUser}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
