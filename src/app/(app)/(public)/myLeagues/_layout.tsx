import { TabsHeader } from '@/components/layout';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';

export default function MyLeaguesLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <TabsHeader tabsLayout={false} />,
        }}
      />
      <Stack.Screen name="join-league" options={{ headerShown: false }} />
      <Stack.Screen name="select-competition" options={{ headerShown: false }} />
      <Stack.Screen name="create-league" options={{ headerShown: false }} />
      <Stack.Screen name="preview-league" options={{ headerShown: false }} />
    </Stack>
  );
}
