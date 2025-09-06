import { useGetFixturesWithPredictions } from '@/hooks/useFixtures';

import { FlatList, View } from 'react-native';
import { Error } from '../layout';
import MatchCard from './MatchCard';
import MatchesSkeleton from './SkeletonMatches';

const MatchList = ({
  selectedRound,
  competitionId,
  userId,
}: {
  selectedRound: string;
  competitionId: number;
  userId: string;
}) => {
  const {
    data: fixtures,
    isLoading,
    error,
    refetch,
  } = useGetFixturesWithPredictions(selectedRound, competitionId, userId);

  if (isLoading) return <MatchesSkeleton />;
  if (error) return <Error error={error} />;

  return (
    <View className="flex-1 ">
      <FlatList
        data={fixtures}
        renderItem={({ item }) => <MatchCard match={item} />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={() => {
          refetch();
        }}
      />
    </View>
  );
};

export default MatchList;
