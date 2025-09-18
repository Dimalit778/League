import { useGetFixturesWithPredictions } from '@/hooks/useFixtures';

import { FixturesWithTeamsAndPredictionsType } from '@/types';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { Error } from '../layout';
import MatchCard from './MatchCard';
import MatchesSkeleton from './SkeletonMatches';

type MatchItem = FixturesWithTeamsAndPredictionsType;

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

  const renderItem = useCallback(
    ({ item }: { item: MatchItem }) => <MatchCard match={item} />,
    []
  );

  const keyExtractor = useCallback((item: MatchItem) => item.id.toString(), []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <MatchesSkeleton />;
  if (error) return <Error error={error} />;

  return (
    <FlatList
      data={fixtures}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      keyExtractor={keyExtractor}
      refreshing={isLoading}
      onRefresh={handleRefresh}
    />
  );
};

export default MatchList;
