import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="help" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
