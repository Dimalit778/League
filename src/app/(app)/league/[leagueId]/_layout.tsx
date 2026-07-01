import { useMyMemberByLeague } from '@/features/members/hooks/useMembers';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';

export default function LeagueLayout() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  console.log('leagueId', leagueId);

  const { data: myMember, isLoading } = useMyMemberByLeague(leagueId);

  if (!leagueId) {
    return <Redirect href="/(app)/(user)/myLeagues" />;
  }

  if (isLoading) {
    return null;
  }

  if (!myMember) {
    return <Redirect href="/(app)/(user)/myLeagues" />;
  }
  console.log('myMember', myMember);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match/[matchId]" />
      <Stack.Screen name="member/[memberId]" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
