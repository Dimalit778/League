import { LoadingOverlay, Screen, TopBar } from '@/components/layout';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/league/TopThree';
import { useGetLeagueLeaderboard } from '@/hooks/useLeaderboard';
import { useMemberStore } from '@/store/MemberStore';
import { FlatList, View } from 'react-native';

const League = () => {
  const { member } = useMemberStore();
  const {
    data: leaderboard,
    isLoading,
    error,
    refetch,
  } = useGetLeagueLeaderboard();

  if (error) console.log('error', error);

  const topThree = leaderboard?.slice(0, 3);

  // Use a separate state for pull-to-refresh loading
  const isRefreshing = false;

  return (
    <Screen>
      <TopBar showLeagueName={true} />
      {isLoading && !leaderboard && <LoadingOverlay />}
      <View className="mt-12">
        <TopThree topMembers={topThree} />
      </View>
      <FlatList
        data={leaderboard || []}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.user_id ?? ''}
        renderItem={({ item, index }) => (
          <LeaderboardCard
            nickname={item.nickname ?? ''}
            avatar_url={item.avatar_url ?? ''}
            total_points={item.total_points ?? 0}
            index={index + 1}
            isCurrentUser={item.user_id === member?.user_id}
          />
        )}
        refreshing={isRefreshing}
        onRefresh={() => {
          console.log('refreshing');
          refetch();
        }}
      />
    </Screen>
  );
};

export default League;
