import { Card, Skeleton, TextSkeleton } from '@/components';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { View } from 'react-native';

function PrimaryLeagueSkeleton() {
  return (
    <View className={spacing.list}>
      <Card padding="lg" className="border border-border">
        <View className="flex-row gap-4">
          <Skeleton className="h-[72px] w-[72px] rounded-full" />

          <View className="min-w-0 flex-1 justify-center gap-3">
            <View className="flex-row items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="min-w-0 flex-1 gap-2">
                <TextSkeleton className="h-6 w-40" />
                <TextSkeleton className="h-4 w-28" />
              </View>
              <Skeleton className="h-8 w-8 rounded-full" />
            </View>

            <Skeleton className="h-px w-full" />

            <View className="flex-row items-center justify-between">
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} className="flex-1 items-center gap-1">
                  <TextSkeleton className="h-3 w-12" />
                  <TextSkeleton className="h-5 w-8" />
                </View>
              ))}
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

function LeagueCardSkeleton() {
  return (
    <View className="px-6">
      <Card padding="lg">
        <View className="flex-row items-center">
          <Skeleton className="h-9 w-9 rounded-full" />
          <View className="mx-3 h-10 w-px bg-border" />
          <View className="min-w-0 flex-1 gap-2">
            <TextSkeleton className="h-5 w-40" />
            <TextSkeleton className="h-4 w-24" />
          </View>
          <View className="mx-2 flex-row items-center gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} className="items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <TextSkeleton className="h-4 w-6" />
              </View>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );
}

export default function LeaguesSkeleton() {
  return (
    <>
      <View className={cn('flex-1  pt-4 sm:px-6 lg:px-8', spacing.section)}>
        <PrimaryLeagueSkeleton />
        <LeagueCardSkeleton />
        <LeagueCardSkeleton />
      </View>
    </>
  );
}
