import { Screen, useFloatBottomTabsInset } from '@/components/layout';
import { Skeleton, TextSkeleton } from '@/components/ui';
import { View } from 'react-native';

function DetailRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between py-4">
      <TextSkeleton className="w-28" />
      <TextSkeleton className="w-20" />
    </View>
  );
}

export function ProfileSkeleton() {
  const bottomTabsInset = useFloatBottomTabsInset();

  return (
    <Screen padding="horizontal" bottomInset={bottomTabsInset} contentClassName="gap-5 pt-3">
      <View className="items-center py-2">
        <Skeleton className="h-40 w-40 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <View className="gap-2">
          <TextSkeleton className="h-3 w-16" />
          <TextSkeleton className="w-32" />
        </View>
        <Skeleton className="h-5 w-5" />
      </View>

      <View className="overflow-hidden rounded-2xl border border-border bg-surface px-3">
        <View className="flex-row items-center gap-2 border-b border-border py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <TextSkeleton className="w-28" />
        </View>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} className={index < 6 ? 'border-b border-border' : ''}>
            <DetailRowSkeleton />
          </View>
        ))}
      </View>

      <View>
        <TextSkeleton className="mb-3 h-6 w-36" />
        <View className="flex-row gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} className="flex-1 items-center rounded-2xl border border-border bg-surface px-2 py-3">
              <Skeleton className="mb-2 h-10 w-10 rounded-full" />
              <TextSkeleton className="w-16" />
              <TextSkeleton className="mt-2 h-3 w-full" />
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
