import LoadingOverlay from '@/components/layout/LoadingOverlay';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/league/TopThree';
import { getLeagueLeaderboard } from '@/services/leaderboardService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';
import { FlatList, View } from 'react-native';

type LeaderboardType = {
  id: string;
  nickname: string;
  avatar_url: string;
  total_points: number;
  index: number;
};

const League = () => {
  const { member } = useMemberStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['league'],
    queryFn: () => getLeagueLeaderboard(member?.league_id ?? ''),
  });

  if (error) console.log('error', error);
  const topThree = data?.slice(0, 3);

  return (
    <View className="flex-1 bg-background pt-10 px-4">
      {isLoading && <LoadingOverlay />}
      <TopThree topMembers={topThree} />
      <FlatList
        data={data}
        contentContainerStyle={{ gap: 10, paddingBottom: 20, paddingTop: 10 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard
            nickname={item.nickname ?? ''}
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
