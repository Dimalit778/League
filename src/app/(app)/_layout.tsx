import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore } from '@/store/MemberStore';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();
  const { data: isAdminUser } = useIsAdmin();
  const activeMember = useMemberStore((s) => s.activeMember);
  const { isPro, exceededLimit } = useSubscriptionLimits();
  const admin = isLoggedIn && !!isAdminUser;
  const requiresLeagueActivation = !isPro && exceededLimit;
  const hasMember = !!activeMember;
  const { colors } = useThemeTokens();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(public)" />
        <Stack.Protected guard={hasMember && !requiresLeagueActivation}>
          <Stack.Screen name="(member)" />
        </Stack.Protected>
        <Stack.Protected guard={!!admin}>
          <Stack.Screen name="(admin)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
