import { useGetUser } from '@/features/admin/hooks/useUsers';
import { SubscriptionSync } from '@/features/subscription/components/SubscriptionSync';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore } from '@/store/MemberStore';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();
  const { data: userData } = useGetUser();
  const role = userData?.role ?? null;
  const activeMember = useMemberStore((s) => s.activeMember);
  const admin = isLoggedIn && role === 'ADMIN';
  const hasMember = !!activeMember;
  const { colors } = useThemeTokens();

  return (
    <>
      {isLoggedIn ? <SubscriptionSync /> : null}
      <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
      <Stack.Protected guard={hasMember}>
        <Stack.Screen name="(member)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!admin}>
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
    </>
  );
}
