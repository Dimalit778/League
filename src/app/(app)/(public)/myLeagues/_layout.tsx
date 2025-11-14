import { TabsHeader } from '@/components/layout';
import { Stack } from '@/components/layout/Stack';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import Transition from 'react-native-screen-transitions';

export default function MyLeaguesLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <TabsHeader showLeagueName={false} />,
        }}
      />
      <Stack.Screen
        name="join-league"
        options={{ ...Transition.presets.DraggableCard(), contentStyle: { backgroundColor: 'transparent' } }}
      />
      <Stack.Screen name="select-competition" options={{ headerShown: false }} />
      <Stack.Screen name="create-league" options={{ headerShown: false }} />
      <Stack.Screen name="preview-league" options={{ headerShown: false }} />
    </Stack>
  );
}
