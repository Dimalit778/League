import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';

export default function LeagueLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match/[matchId]" />
      <Stack.Screen
        name="member/[memberId]"
        options={{
          headerShown: true,
          title: t('Member Details'),
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen name="edit-league" />
      <Stack.Screen name="report-content" />
    </Stack>
  );
}
