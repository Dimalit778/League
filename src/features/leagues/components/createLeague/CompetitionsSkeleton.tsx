import { Screen, Skeleton, TextSkeleton } from '@/components';
import { View } from 'react-native';

function CompetitionCardSkeleton() {
  return (
    <View className="items-center overflow-hidden rounded-xl border-2 border-border bg-surface p-4">
      <Skeleton className="h-12 w-12 rounded-md" />
      <View className="mt-3 items-center gap-2">
        <TextSkeleton className="h-3 w-16" />
        <TextSkeleton className="h-5 w-24" />
      </View>
    </View>
  );
}

export default function CompetitionsSkeleton() {
  return (
    <Screen edges={['bottom']}>
      <View className="flex-1 flex-row flex-wrap gap-3 px-4 pt-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} className="w-[48%]">
            <CompetitionCardSkeleton />
          </View>
        ))}
      </View>
      <View className="p-3">
        <Skeleton className="h-14 w-full rounded-xl" />
      </View>
    </Screen>
  );
}
