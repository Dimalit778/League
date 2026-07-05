import { LoadingBall } from '@/components/layout/LoadingBall';
import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore } from '@/store/MemberStore';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const primaryMember = useMemberStore((s) => s.primaryMember);
  const loading = useMemberStore((s) => s.loading);
  const initializeMember = useMemberStore((s) => s.initializeMember);
  const { data: isAdminUser } = useIsAdmin();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      void initializeMember();
    }
  }, [isAuthLoading, isLoggedIn, initializeMember]);

  if (isAuthLoading || loading) {
    return <LoadingBall />;
  }

  const hasPrimaryMember = !!primaryMember;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(user)" />
      <Stack.Protected guard={hasPrimaryMember}>
        <Stack.Screen name="(league)" />
      </Stack.Protected>
      <Stack.Protected guard={!!isAdminUser}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
    </Stack>
  );
}
