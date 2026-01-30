import { Error, Screen } from '@/components/layout';
import LeagueSkeleton from '@/features/leagues/components/LeagueSkeleton';
import { useGetLeaderboard } from '@/features/leagues/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';
import { FlatList, View } from 'react-native';
import LeaderboardCard from '../components/LeaderboardCard';
import TopThree from '../components/TopThree';

const LeagueScreen = () => {
  const leagueId = useMemberStore((s) => s.leagueId ?? '');
  const memberId = useMemberStore((s) => s.memberId ?? '');

  const { data: leaderboard, isLoading, error } = useGetLeaderboard(leagueId);

  const topThree = leaderboard?.slice(0, 3) ?? [];

  if (error) return <Error error={error} />;
  if (!leaderboard || isLoading) return <LeagueSkeleton />;
  return (
    <Screen>
      <View style={{ paddingTop: 56 }}>
        <TopThree topMembers={topThree} />
      </View>

      <FlatList
        data={leaderboard}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item, index) => item.member_id ?? `member-${index}`}
        renderItem={({ item, index }) => (
          <LeaderboardCard item={item} index={index} isCurrentUser={item.member_id === memberId} />
        )}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />
    </Screen>
  );
};

export default LeagueScreen;
