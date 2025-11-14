import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { FlatList, View } from 'react-native';

const skeletonFixtures = Array.from({ length: 10 });
const TEAM_LOGO_SIZE = 44;

export default function SkeletonMatches() {
  return (
    <FlatList
      data={skeletonFixtures}
      keyExtractor={(_, i) => `fixture-skeleton-${i}`}
      scrollEnabled={false}
      renderItem={() => (
        <View className="mx-2 my-2 rounded-3xl bg-surface relative overflow-hidden">
          {/* MatchHeader skeleton */}
          <View className="bg-muted flex-row items-center justify-center px-4 py-1">
            <View className="flex-1">
              <AnimatedSkeleton style={{ height: 6, width: 50 }} />
            </View>
            <View className="min-w-[60px] mx-3">
              <AnimatedSkeleton
                style={{ height: 10, width: 60, borderRadius: 4 }}
              />
            </View>
            <View className="flex-1 items-end">
              <AnimatedSkeleton style={{ height: 6, width: 50 }} />
            </View>
          </View>

          {/* Main content skeleton */}
          <View className="flex-row justify-between py-4 px-2">
            {/* Home team */}
            <View className="flex-1 items-center">
              <AnimatedSkeleton
                style={{
                  width: TEAM_LOGO_SIZE,
                  height: TEAM_LOGO_SIZE,
                  borderRadius: TEAM_LOGO_SIZE / 2,
                  marginBottom: 8,
                }}
              />
              <AnimatedSkeleton style={{ height: 14, width: 80 }} />
            </View>

            {/* Score display */}
            <View className="min-w-[80px] max-w-[100px] flex-1 items-center justify-center">
              <AnimatedSkeleton
                style={{ height: 32, width: 60, borderRadius: 6 }}
              />
            </View>

            {/* Away team */}
            <View className="flex-1 items-center">
              <AnimatedSkeleton
                style={{
                  width: TEAM_LOGO_SIZE,
                  height: TEAM_LOGO_SIZE,
                  borderRadius: TEAM_LOGO_SIZE / 2,
                  marginBottom: 8,
                }}
              />
              <AnimatedSkeleton style={{ height: 14, width: 80 }} />
            </View>
          </View>
        </View>
      )}
    />
  );
}
