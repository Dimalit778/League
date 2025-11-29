import { Error } from '@/components/layout';
import { useMemberStore } from '@/store/MemberStore';
import { useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useGetMatches } from '../../hooks/useMatches';
import MatchesSkeleton from '../MatchesSkeleton';
import MatchesListCard from './MatchesListCard';

type MatchesListProps = {
  selectedFixture: number;
};

export default function MatchesList({ selectedFixture }: MatchesListProps) {
  const competitionId = useMemberStore((s) => s.competitionId);
  const memberId = useMemberStore((s) => s.memberId);

  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading, isFetching, refetch, isRefetching, error } = useGetMatches({
    selectedFixture,
    competitionId,
    memberId,
  });

  if (error) return <Error error={error} />;

  if (isLoading) return <MatchesSkeleton />;

  return (
    <FlatList
      ref={flatListRef}
      refreshing={isFetching || isRefetching}
      onRefresh={refetch}
      key={`fixture-${selectedFixture}`}
      data={data ?? []}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MatchesListCard key={item.id} match={item} />}
      ItemSeparatorComponent={() => <View className="h-3 " />}
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
