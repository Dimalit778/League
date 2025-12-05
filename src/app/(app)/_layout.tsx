import { useGetUser } from '@/features/admin/hooks/useUsers';
import { usePrimaryMember } from '@/features/members/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/providers/AuthProvider';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();
  const { data: userData } = useGetUser();
  const role = userData?.role ?? null;
  const { data: primaryMember } = usePrimaryMember();
  const admin = isLoggedIn && role === 'ADMIN';
  const hasMember = !!primaryMember;
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
