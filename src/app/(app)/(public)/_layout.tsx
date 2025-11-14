import { Stack } from '@/components/layout/Stack';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import Transition from 'react-native-screen-transitions';

export default function PublicLayout() {
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
      <Stack.Screen name="myLeagues" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{ ...Transition.presets.DraggableCard(), contentStyle: { backgroundColor: 'transparent' } }}
      />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
    </Stack>
  );
}
