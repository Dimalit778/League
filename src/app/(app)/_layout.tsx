import { useGetUser } from '@/features/admin/hooks/useUsers';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';

import { Stack } from '@/components/layout/Stack';

export default function AppLayout() {
  const hasMember = useMemberStore((s) => !!s.memberId);
  const user = useGetUser();
  const admin = user?.data?.role === 'ADMIN';

  const { colors } = useThemeTokens();

  return (
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
  );
}
