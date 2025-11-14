import { Error } from '@/components/layout';
import { useGetMatchesWithMemberPredictions } from '@/hooks/useMatches';
import { useEffect, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import MatchesSkeleton from '../skeleton/MatchesSkeleton';
import MatchCard from './MatchCard';

interface MatchListProps {
  selectedFixture: number;
  competitionId: number;
  memberId: string;
}

export default function MatchesList({ selectedFixture, competitionId, memberId }: MatchListProps) {
  const flatListRef = useRef<FlatList>(null);
  const {
    data: matches,
    isLoading,
    error,
  } = useGetMatchesWithMemberPredictions(selectedFixture, competitionId, memberId);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedFixture]);

  if (error) return <Error error={error} />;

  if (!matches && isLoading) return <MatchesSkeleton />;

  return (
    <FlatList
      ref={flatListRef}
      key={`fixture-${selectedFixture}`}
      data={matches}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MatchCard match={item} />}
      getItemLayout={(_, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
      removeClippedSubviews={true}
      initialScrollIndex={0}
      ListEmptyComponent={
        <View className="p-4 items-center">
          <Text className="text-text/50 text-center">No finished matches in this fixture</Text>
        </View>
      }
    />
  );
}
