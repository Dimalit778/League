import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { FlatList, View } from 'react-native';

const skeletonFixtures = Array.from({ length: 89 });

export default function MatchesSkeleton() {
  return (
    <FlatList
      data={skeletonFixtures}
      keyExtractor={(_, i) => `fixture-skeleton-${i}`}
      scrollEnabled={false}
      renderItem={() => (
        <View className="flex-row items-center bg-surface p-2 my-1 border-b border-t border-border">
          {/* Home team */}
          <View className="flex-row items-center flex-1 justify-end gap-2">
            <AnimatedSkeleton style={{ height: 16, width: 96 }} />
            <AnimatedSkeleton
              style={{ width: 35, height: 35, borderRadius: 15 }}
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
              style={{ width: 35, height: 35, borderRadius: 15 }}
            />
            <AnimatedSkeleton style={{ height: 16, width: 96 }} />
          </View>
        </View>
      )}
    />
  );
}
