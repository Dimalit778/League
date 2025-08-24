import LoadingOverlay from '@/components/layout/LoadingOverlay';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/league/TopThree';
import { useGetLeagueLeaderboard } from '@/hooks/useLeaderboard';
import { FlatList, View } from 'react-native';

type LeaderboardType = {
  id: string;
  nickname: string;
  avatar_url: string;
  total_points: number;
  index: number;
};

const League = () => {
  const { data: leaderboard, isLoading } = useGetLeagueLeaderboard();

  if (isLoading) return <LoadingOverlay />;

  const topThree = leaderboard?.slice(0, 3);

  return (
    <View className="flex-1 bg-background pt-10 px-4">
      <TopThree topMembers={topThree as LeaderboardType[]} />
      <FlatList
        data={leaderboard}
        contentContainerStyle={{ gap: 10, paddingBottom: 20, paddingTop: 10 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard
            nickname={item.nickname}
            avatar_url={item.avatar_url ?? ''}
            total_points={item.total_points ?? 0}
            index={index + 1}
          />
        )}
        keyExtractor={(item) => item.user_id ?? ''}
      />
    </View>
  );
};

export default League;
