import { NavigationHeader } from '@/components';
import { useRequiresLeagueActivation } from '@/features/leagues/hooks/useRequiresLeagueActivation';
import { usePrefetchLeagueData } from '@/features/matches/hooks/usePrefetchLeagueData';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function LeagueLayout() {
  const requiresLeagueActivation = useRequiresLeagueActivation();
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  // Deferred (runAfterInteractions) warm-up of the Matches + Leaderboard caches
  // so those tabs open instantly. Called before the redirect to keep hook order
  // stable; it no-ops until the primary-league store is populated.
  usePrefetchLeagueData();

  if (requiresLeagueActivation) {
    return <Redirect href="/(app)/(user)/leagues/my-leagues" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        fullScreenGestureEnabled: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, gestureEnabled: false, fullScreenGestureEnabled: false }}
      />
      <Stack.Screen name="match/[matchId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="member/[memberId]"
        options={{
          header: () => <NavigationHeader title={t('Member Details')} fallbackHref="/(app)/(league)/(tabs)" />,
        }}
      />
      <Stack.Screen
        name="edit-league"
        options={{
          header: () => <NavigationHeader title={t('Manage League')} fallbackHref="/(app)/(league)/(tabs)" />,
        }}
      />
      <Stack.Screen
        name="report-content"
        options={{
          header: () => <NavigationHeader title={t('Report content')} fallbackHref="/(app)/(league)/(tabs)" />,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          header: () => <NavigationHeader title={t('Notifications')} fallbackHref="/(app)/(league)/(tabs)" />,
        }}
      />
    </Stack>
  );
}
