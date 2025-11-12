import { useGetMatchesWithPredictions } from '@/hooks/useMatches';

import { Error } from '@/components/layout';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import MatchCard from './MatchCard';
import MatchesSkeleton from './SkeletonMatches';

type MatchListProps = {
  selectedFixture: number;
  competitionId: number;
  userId: string;
  handleFixturePress?: (fixture: number) => void;
  animateScroll?: boolean;
};

const MatchList = ({
  selectedFixture,
  competitionId,
  userId,
}: MatchListProps) => {
  const isFocused = useIsFocused();
  const {
    data: matches,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMatchesWithPredictions(selectedFixture, competitionId, userId);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (!matches && isLoading) return <MatchesSkeleton />;

  return (
    <FlatList
      data={matches}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      refreshing={isFocused && isFetching}
      onRefresh={handleRefresh}
      renderItem={({ item }) => <MatchCard match={item} />}
      style={{ paddingTop: 10 }}
      getItemLayout={(_, index) => ({
        length: 120,
        offset: 120 * index,
        index,
      })}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      legacyImplementation={false}
      disableVirtualization={false}
    />
  );
};
export default MatchList;
