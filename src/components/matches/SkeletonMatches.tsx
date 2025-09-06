import { Screen } from '@/components/layout';
import { FlatList, View } from 'react-native';

const rounds = [1, 2, 3, 4, 5, 6, 7];
const skeletonFixtures = Array.from({ length: 8 });

export default function MatchesSkeleton() {
  return (
    <Screen>
      <View className="flex-1 bg-background">
        {/* Fixtures skeleton list */}
        <FlatList
          data={skeletonFixtures}
          keyExtractor={(_, i) => `fixture-skeleton-${i}`}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          scrollEnabled={false}
          renderItem={() => (
            <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 mt-3">
              {/* Home team */}
              <View className="flex-row items-center flex-1">
                <View className="w-6 h-6 bg-border rounded-full animate-pulse mr-2" />
                <View className="h-4 w-24 bg-border rounded animate-pulse" />
              </View>

              {/* Date + time */}
              <View className="items-center px-2">
                <View className="h-3 w-12 bg-border rounded-md animate-pulse mb-2" />
                <View className="h-3 w-12 bg-border rounded-md animate-pulse" />
              </View>

              {/* Away team */}
              <View className="flex-row items-center flex-1 justify-end">
                <View className="h-4 w-24 bg-border rounded animate-pulse mr-2" />
                <View className="w-6 h-6 bg-border rounded-full animate-pulse" />
              </View>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
