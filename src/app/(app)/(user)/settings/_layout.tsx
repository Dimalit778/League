import { useThemeTokens } from '@/hooks/useThemeTokens';
import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, router } from 'expo-router';

export default function SettingsLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        fullScreenGestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerLeft: () => <HeaderBackButton tintColor={colors.text} onPress={() => router.back()} />,
        }}
      />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms' }} />
      <Stack.Screen name="help" options={{ title: 'Help' }} />
      <Stack.Screen name="subscription" options={{ title: 'Subscription' }} />
    </Stack>
  );
}
