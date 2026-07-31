import { Screen } from '@/components/layout';
import { Skeleton, TextSkeleton } from '@/components/ui';
import { View } from 'react-native';

function CompetitionCardSkeleton() {
  return (
    <View className="mb-3 overflow-hidden rounded-xl border-2 border-border bg-surface p-4">
      <View className="flex-row items-center">
        <Skeleton className="h-12 w-12 rounded-md" />
        <View className="flex-1 items-center gap-2">
          <TextSkeleton className="h-3 w-16" />
          <TextSkeleton className="h-5 w-28" />
        </View>
        <Skeleton className="h-[52px] w-[52px] rounded-md" />
      </View>
    </View>
  );
}

export default function CompetitionsSkeleton() {
  return (
    <Screen edges={['bottom']}>
      <View className="flex-1 px-[18px] pt-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CompetitionCardSkeleton key={index} />
        ))}
      </View>
      <View className="p-3">
        <Skeleton className="h-14 w-full rounded-xl" />
      </View>
    </Screen>
  );
}
