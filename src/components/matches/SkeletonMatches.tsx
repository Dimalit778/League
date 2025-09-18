import { FlatList, View } from 'react-native';

const rounds = [1, 2, 3, 4, 5, 6, 7];
const skeletonFixtures = Array.from({ length: 8 });

export default function MatchesSkeleton() {
  return (
    <FlatList
      data={skeletonFixtures}
      keyExtractor={(_, i) => `fixture-skeleton-${i}`}
      scrollEnabled={false}
      renderItem={() => (
        <View className="flex-row items-center bg-surface px-3 p-2 mb-3">
          {/* Home team */}
          <View className="flex-row items-center flex-1 justify-end gap-2">
            <View className="h-4 w-24 bg-border rounded animate-pulse" />
            <View className="w-10 h-10 bg-border rounded-full animate-pulse " />
          </View>

          {/* Date + time */}
          <View className="items-center w-16 h-8 p-2 bg-border rounded-md animate-pulse mx-2" />

          {/* Away team */}
          <View className="flex-row items-center flex-1 justify-start gap-2">
            <View className="w-10 h-10 bg-border rounded-full animate-pulse" />
            <View className="h-4 w-24 bg-border rounded animate-pulse " />
          </View>
        </View>
      )}
    />
  );
}
