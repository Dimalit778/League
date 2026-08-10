import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';

export default function LeaguesLayout() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
      }}
      initialRouteName="my-leagues"
    >
      <Stack.Screen name="my-leagues" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
      <Stack.Screen name="join-league" options={{ gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <Stack.Screen
        name="create-league/competitions"
        options={{
          headerShown: true,
          title: t('Select Competition'),
        }}
      />
      <Stack.Screen
        name="create-league/details"
        options={{
          headerShown: true,
          title: t('League Details'),
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
