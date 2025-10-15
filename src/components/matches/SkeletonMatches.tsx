import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
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
            <AnimatedSkeleton style={{ height: 16, width: 96 }} />
            <AnimatedSkeleton
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </View>

          {/* Date + time */}
          <View className="items-center mx-2">
            <AnimatedSkeleton
              style={{ width: 64, height: 32, borderRadius: 8 }}
            />
          </View>

          {/* Away team */}
          <View className="flex-row items-center flex-1 justify-start gap-2">
            <AnimatedSkeleton
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <AnimatedSkeleton style={{ height: 16, width: 96 }} />
          </View>
        </View>
      )}
    />
  );
}
