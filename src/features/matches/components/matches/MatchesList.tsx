import { Error } from '@/components/layout';
import { useMemberStore } from '@/store/MemberStore';
import { useEffect, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useGetMatchesByFixtureWithMemberPredictions } from '../../hooks/useMatches';
import MatchesSkeleton from '../MatchesSkeleton';
import MatchesListCard from './MatchesListCard';

export default function MatchesList({ selectedFixture }: { selectedFixture: number }) {
  const competitionId = useMemberStore((s) => s.competitionId ?? 0);
  const leagueId = useMemberStore((s) => s.leagueId ?? '');
  const memberId = useMemberStore((s) => s.memberId ?? '');
  const flatListRef = useRef<FlatList>(null);

  const {
    data: matches,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
    error,
  } = useGetMatchesByFixtureWithMemberPredictions(selectedFixture, leagueId, competitionId, memberId);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedFixture]);

  if (error) return <Error error={error} />;

  if (!matches && isLoading) return <MatchesSkeleton />;

  return (
    <FlatList
      ref={flatListRef}
      refreshing={isFetching || isRefetching}
      onRefresh={refetch}
      key={`fixture-${selectedFixture}`}
      data={matches}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MatchesListCard match={item} />}
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
