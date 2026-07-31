import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Stack } from 'expo-router';

export default function LeaguesLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="my-leagues"
    >
      <Stack.Screen name="my-leagues" />
      <Stack.Screen name="join-league" />
      <Stack.Screen
        name="create-league/competitions"
        options={{
          headerShown: true,
          title: 'Select Competition',
        }}
      />
      <Stack.Screen
        name="create-league/details"
        options={{
          headerShown: true,
          title: 'League Details',
        }}
      />
      <Stack.Screen
        name="create-league/success"
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
