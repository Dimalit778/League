import { useGetUser } from '@/features/admin/hooks/useUsers';
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
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(public)" />
        <Stack.Protected guard={hasMember}>
          <Stack.Screen name="(member)" />
        </Stack.Protected>
        <Stack.Protected guard={!!admin}>
          <Stack.Screen name="(admin)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
