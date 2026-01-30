import { Screen } from '@/components/layout';
import { Card } from '@/components/ui';
import SkeletonFixtures from '@/features/matches/components/FixturesSkeleton';
import SkeletonMatches from '@/features/matches/components/MatchesSkeleton';
import { View } from 'react-native';

export function MemberDetailsSkeleton() {
  return (
    <Screen>
      {/* Member Header Card Skeleton */}
      <Card className="px-3 py-1.5">
        <View className="flex-row items-center gap-3">
          {/* Avatar Skeleton */}
          <View className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-muted animate-pulse" />

          {/* Name Section Skeleton */}
          <View className="flex-1">
            <View className="w-32 h-5 bg-muted rounded animate-pulse" />
          </View>

          {/* Stats Section Skeleton */}
          <View className="flex-row items-center gap-4">
            <View className="items-end">
              <View className="w-12 h-3 bg-muted rounded animate-pulse mb-1" />
              <View className="w-8 h-4 bg-muted rounded animate-pulse" />
            </View>
            <View className="h-6 w-px bg-border" />
            <View className="items-end">
              <View className="w-16 h-3 bg-muted rounded animate-pulse mb-1" />
              <View className="w-6 h-4 bg-muted rounded animate-pulse" />
            </View>
          </View>
        </View>
      </Card>

      {/* Member Stats Card Skeleton */}
      <Card className="p-2 my-2">
        {/* Top Row Stats */}
        <View className="flex-row mb-2">
          {[1, 2].map((item) => (
            <View key={item} className="flex-1 px-2">
              <View className="bg-surface border border-border rounded-lg p-2 items-center justify-center">
                <View className="w-16 h-3 bg-muted rounded animate-pulse mb-1" />
                <View className="w-8 h-4 bg-muted rounded animate-pulse" />
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Row Stats */}
        <View className="flex-row">
          {[1, 2, 3].map((item) => (
            <View key={item} className="flex-1 px-2">
              <View className="bg-surface border border-border rounded-lg p-2 items-center justify-center">
                <View className="w-12 h-3 bg-muted rounded animate-pulse mb-1" />
                <View className="w-6 h-4 bg-muted rounded animate-pulse" />
              </View>
            </View>
          ))}
        </View>
      </Card>
      <SkeletonFixtures />
      <SkeletonMatches />
    </Screen>
  );
}

export default MemberDetailsSkeleton;
