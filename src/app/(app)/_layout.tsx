import { useGetUser } from '@/features/admin/hooks/useUsers';
import { usePrimaryMember } from '@/features/members/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuth } from '@/providers/AuthProvider';
import { useMemberStore } from '@/store/MemberStore';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();
  const { data: userData } = useGetUser();
  const role = userData?.role ?? null;
  const { data: primaryMember, isLoading: isPrimaryMemberLoading } = usePrimaryMember();
  const activeMember = useMemberStore((s) => s.activeMember);
  const admin = isLoggedIn && role === 'ADMIN';
  const hasMember = !!primaryMember || !!activeMember;
  const { colors } = useThemeTokens();

  if (isPrimaryMemberLoading && !activeMember) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

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
