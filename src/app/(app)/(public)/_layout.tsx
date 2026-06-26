import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function PublicLayout() {
  const { colors } = useThemeTokens();
  const { isPro, exceededLimit } = useSubscriptionLimits();
  const requiresLeagueActivation = !isPro && exceededLimit;

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
      <Stack.Screen name="myLeagues" />
      <Stack.Protected guard={!requiresLeagueActivation}>
        <Stack.Screen name="settings" />
      </Stack.Protected>
    </Stack>
  );
}
