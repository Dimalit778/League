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
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
      }}
    >
      <Stack.Screen name="leagues" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
      <Stack.Screen
        name="settings"
        options={{
          gestureEnabled: true,
          fullScreenGestureEnabled: Platform.OS === 'ios',
        }}
      />
    </Stack>
  );
}
