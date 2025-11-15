import { Stack } from '@/components/layout/Stack';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import Transition from 'react-native-screen-transitions';

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
          ...Transition.presets.ZoomIn(),
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="member/id" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit-league" options={{ headerShown: false }} />
    </Stack>
  );
}
