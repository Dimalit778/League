import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { Stack } from 'expo-router';

export default function MemberLayout() {
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
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="match/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="member/id" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit-league" options={{ headerShown: false }} />
    </Stack>
  );
}
