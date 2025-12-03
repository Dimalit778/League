import { useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import MatchesSkeleton from '../MatchesSkeleton';
import MatchesCard from './MatchesCard';

type MatchesListProps = {
  matches: MatchWithPredictionsType[];
};
export default function MatchesList({ matches }: MatchesListProps) {
  const flatListRef = useRef<FlatList>(null);

  if (!matches) return <MatchesSkeleton />;

  return (
    <View className="">
      <FlatList
        ref={flatListRef}
        data={matches}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MatchesCard key={item.id} match={item} />}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        scrollEnabled={false}
        ListEmptyComponent={
          <View className="p-4 items-center">
            <Text className="text-text/50 text-center">No finished matches in this fixture</Text>
          </View>
        }
      />
    </View>
  );
}
