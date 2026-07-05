import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function PublicLayout() {
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
      <Stack.Screen name="index" />
      <Stack.Screen name="leagues" />
      <Stack.Screen
        name="settings"
        options={{
          // Let the nested settings stack handle swipe-back (help → settings index).
          // Without this, iOS full-screen back pops the whole settings screen to leagues.
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
      />
    </Stack>
  );
}
