import { HeaderChrome } from '@/components/layout';
import { Card, Screen, Skeleton, TextSkeleton } from '@/components/ui';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { View } from 'react-native';

function LeaguesIndicatorSkeleton() {
  return (
    <HeaderChrome>
      <View className="w-full flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <TextSkeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </View>
        <Skeleton className="h-11 w-11 rounded-full" />
      </View>
    </HeaderChrome>
  );
}

function PrimaryLeagueSkeleton() {
  return (
    <View className={spacing.list}>
      <View className="flex-row items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <TextSkeleton className="h-5 w-28" />
      </View>
      <Card padding="lg" className="border border-border">
        <View className="flex-row gap-4">
          <Skeleton className="h-[72px] w-[72px] rounded-full" />

          <View className="min-w-0 flex-1 justify-center gap-3">
            <View className="flex-row items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="min-w-0 flex-1 gap-2">
                <TextSkeleton className="h-6 w-2/3" />
                <TextSkeleton className="h-4 w-1/2" />
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
            <TextSkeleton className="h-5 w-2/3" />
            <TextSkeleton className="h-4 w-1/3" />
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
    <Screen edges={['bottom']} padding="none" className="flex-1">
      <LeaguesIndicatorSkeleton />
      <View className={cn('flex-1 px-4 pt-2 sm:px-6 lg:px-8', spacing.section)}>
        <PrimaryLeagueSkeleton />
        <LeagueCardSkeleton />
        <LeagueCardSkeleton />
      </View>
    </Screen>
  );
}
