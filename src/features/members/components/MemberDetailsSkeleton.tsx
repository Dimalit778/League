import { Card, Skeleton, TextSkeleton } from '@/components';
import { View } from 'react-native';

export function MemberDetailsSkeleton() {
  return (
    <View className="flex-1 gap-4  p-4 sm:px-6 lg:px-8">
      <Card variant="hero" contentClassName="items-center ">
        <Skeleton className="h-24 w-24 rounded-full" />
        <TextSkeleton className="mt-3 h-6 w-32" />
        <TextSkeleton className="mt-2 w-24" />
        <View className="mt-5 w-full flex-row items-center rounded-2xl bg-subtle py-3">
          <View className="flex-1 items-center gap-2">
            <TextSkeleton className="w-12" />
            <Skeleton className="h-7 w-10" />
          </View>
          <View className="h-11 w-px bg-border" />
          <View className="flex-1 items-center gap-2">
            <TextSkeleton className="w-14" />
            <Skeleton className="h-7 w-12" />
          </View>
        </View>
      </Card>

      <TextSkeleton className="h-6 w-40" />
      <Card variant="elevated" contentClassName="flex-row items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <View className="min-w-0 flex-1 gap-3">
          <TextSkeleton className="w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
          <TextSkeleton className="w-32" />
        </View>
      </Card>

      {[0, 1].map((row) => (
        <View key={row} className="flex-row gap-2">
          {[0, 1, 2].map((item) => (
            <Card key={item} variant="soft" padding="sm" className="flex-1" contentClassName="items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-8" />
              <TextSkeleton className="w-14" />
            </Card>
          ))}
        </View>
      ))}
    </View>
  );
}

export default MemberDetailsSkeleton;
