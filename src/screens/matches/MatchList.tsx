import { useGetMatchesWithPredictions } from '@/hooks/useMatches';

import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Error } from '../../components/layout';
import MatchCard from './MatchCard';
import MatchdaysList from './MatchdaysList';
import MatchesSkeleton from './SkeletonMatches';

type MatchListProps = {
  selectedMatchday: number;
  competitionId: number;
  userId: string;
  matchdays?: number[];
  handleMatchdayPress?: (matchday: number) => void;
  animateScroll?: boolean;
};

const MatchList = ({
  selectedMatchday,
  competitionId,
  userId,
  matchdays,
  handleMatchdayPress,
  animateScroll,
}: MatchListProps) => {
  const insets = useSafeAreaInsets();
  const {
    data: matches,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMatchesWithPredictions(selectedMatchday, competitionId, userId);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (!matches && isLoading) return <MatchesSkeleton />;

  const ListHeaderComponent = () => {
    if (!matchdays || !handleMatchdayPress) return null;

    return (
      <View className="mb-3">
        <MatchdaysList
          matchdays={matchdays}
          selectedMatchday={selectedMatchday}
          handleMatchdayPress={handleMatchdayPress}
          animateScroll={animateScroll || false}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={matches}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      refreshing={isFetching}
      onRefresh={handleRefresh}
      renderItem={({ item }) => <MatchCard match={item} />}
      ListHeaderComponent={ListHeaderComponent}
      contentInsetAdjustmentBehavior="automatic"
      windowSize={5}
      updateCellsBatchingPeriod={100}
      getItemLayout={(_, index) => ({
        length: 120,
        offset: 120 * index,
        index,
      })}
      // Lazy loading optimizations
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      // Memory optimizations
      legacyImplementation={false}
      disableVirtualization={false}
      style={{ flex: 1 }}
    />
  );
};
export default MatchList;
