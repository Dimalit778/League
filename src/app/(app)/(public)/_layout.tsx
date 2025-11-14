import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';

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
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
    </Stack>
  );
}
