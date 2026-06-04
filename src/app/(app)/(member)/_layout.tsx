import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function MemberLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="match/[id]"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="member/id" />
      <Stack.Screen name="profile/edit-league" />
    </Stack>
  );
}
