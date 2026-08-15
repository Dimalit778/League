import { NavigationHeader } from '@/components';
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
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
      }}
      initialRouteName="my-leagues"
    >
      <Stack.Screen name="my-leagues" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
      <Stack.Screen
        name="join-league"
        options={{
          headerShown: true,
          header: () => (
            <NavigationHeader title={t('Join League')} fallbackHref="/(app)/(user)/leagues/my-leagues" />
          ),
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="create-league/competitions"
        options={{
          headerShown: true,
          header: () => (
            <NavigationHeader title={t('Select Competition')} fallbackHref="/(app)/(user)/leagues/my-leagues" />
          ),
        }}
      />
      <Stack.Screen
        name="create-league/details"
        options={{
          headerShown: true,
          header: () => (
            <NavigationHeader title={t('League Details')} fallbackHref="/(app)/(user)/leagues/my-leagues" />
          ),
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
