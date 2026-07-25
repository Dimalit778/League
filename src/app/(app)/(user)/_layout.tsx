import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function UserLayout() {
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
      <Stack.Screen name="leagues" />
      <Stack.Screen
        name="settings"
        options={{
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
      />
    </Stack>
  );
}
