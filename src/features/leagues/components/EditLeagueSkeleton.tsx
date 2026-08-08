import { Screen, Skeleton, TextSkeleton } from '@/components';
import { View } from 'react-native';

function MemberRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Skeleton className="h-10 w-10 rounded-full" />
      <TextSkeleton className="flex-1" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </View>
  );
}

export function EditLeagueSkeleton() {
  return (
    <Screen scroll padding="horizontal" contentClassName="gap-5 pt-4">
      <View className="rounded-2xl border border-border bg-surface p-4">
        <View className="mb-4 flex-row items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <View className="flex-1 gap-2">
            <TextSkeleton className="h-5 w-36" />
            <TextSkeleton className="h-3 w-24" />
          </View>
        </View>
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="mt-4 h-14 w-full rounded-xl" />
        <Skeleton className="mt-3 h-11 w-full rounded-xl" />
      </View>

      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <TextSkeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </View>
        <View className="rounded-2xl border border-border bg-surface px-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className={index < 3 ? 'border-b border-border' : ''}>
              <MemberRowSkeleton />
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
