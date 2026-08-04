import { Screen, Section, useFloatBottomTabsInset } from '@/components/layout';
import { BoxSkeleton, Card, CardSkeleton, Skeleton, TextSkeleton } from '@/components/ui';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { View } from 'react-native';

function LeagueHeroSkeleton() {
  return (
    <Card variant="hero">
      <View className={cn('flex-row items-center', spacing.list)}>
        <Skeleton className="h-14 w-14 rounded-full" />
        <View className={cn(' flex-1', spacing.row)}>
          <TextSkeleton className="h-7 w-40" />
          <TextSkeleton className="w-28" />
        </View>
      </View>
      <Skeleton className="my-4 h-px w-full" />
      <View className="flex-row justify-around">
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} className={cn('items-center', spacing.row)}>
            <Skeleton className="h-5 w-5" />
            <TextSkeleton className="w-12" />
            <TextSkeleton className="h-6 w-8" />
          </View>
        ))}
      </View>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <View className={cn('flex-row', spacing.list)}>
      {Array.from({ length: 3 }).map((_, index) => (
        <CardSkeleton key={index} className="flex-1" />
      ))}
    </View>
  );
}

export default function OverviewSkeleton() {
  const bottomTabsInset = useFloatBottomTabsInset();

  return (
    <Screen padding="horizontal" bottomInset={bottomTabsInset + 16} contentClassName={cn(spacing.section, 'pt-3')}>
      <LeagueHeroSkeleton />
      <Section contentClassName="gap-3 ">
        <TextSkeleton className="w-20" />
        <CardSkeleton />
      </Section>
      <Section contentClassName="gap-3">
        <TextSkeleton className="w-20" />
        <StatsSkeleton />
      </Section>
      <Section contentClassName="gap-3">
        <TextSkeleton className="w-20" />
        <BoxSkeleton />
      </Section>
    </Screen>
  );
}
