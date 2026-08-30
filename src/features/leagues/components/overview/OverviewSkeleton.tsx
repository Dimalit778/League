import { images } from '@/assets/images';
import { BoxSkeleton, Card, CardSkeleton, CollapsibleHeader, Row, Section, Skeleton, TextSkeleton } from '@/components';
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

function ExpandedHeaderSkeleton() {
  return (
    <Row className="items-start justify-between px-4">
      <View className="h-9 w-9 shrink-0" />
      <View className="flex-1 items-center gap-2 pt-8">
        <TextSkeleton className="h-5 w-16" />
        <TextSkeleton className="h-8 w-28" />
      </View>
      <View className="h-12 w-12 shrink-0" />
    </Row>
  );
}

function CollapsedHeaderSkeleton() {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="h-9 w-9 shrink-0" />
      <TextSkeleton className="h-5 w-24" />
      <View className="h-12 w-12 shrink-0" />
    </Row>
  );
}

function PersistentHeaderSkeleton() {
  return (
    <Row className="h-12 items-start justify-between px-4">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="h-12 w-12 rounded-full" />
    </Row>
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
  return (
    <CollapsibleHeader
      backgroundImage={images.stadium}
      expandedHeight={260}
      collapsedHeight={48}
      overlap={50}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      expandedHeader={<ExpandedHeaderSkeleton />}
      collapsedHeader={<CollapsedHeaderSkeleton />}
      persistentHeader={<PersistentHeaderSkeleton />}
    >
      <View className={cn(spacing.section)}>
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
      </View>
    </CollapsibleHeader>
  );
}
