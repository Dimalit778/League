import { images } from '@/assets/images';
import { CollapsibleHeader, Row, Skeleton, TextSkeleton } from '@/components';
import { View } from 'react-native';

function DetailRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between py-4">
      <TextSkeleton className="w-28" />
      <TextSkeleton className="w-20" />
    </View>
  );
}

function PersistentHeaderSkeleton() {
  return (
    <Row className="items-start justify-end px-4">
      <Skeleton className="h-12 w-12 rounded-full" />
    </Row>
  );
}

function CollapsedHeaderSkeleton() {
  return (
    <Row className="h-12 items-center justify-between px-4">
      <View className="min-w-0 flex-1 flex-row-reverse items-center gap-2.5">
        <Skeleton className="h-7 w-28 rounded-md" />
      </View>
      <View className="h-12 w-12 shrink-0" />
    </Row>
  );
}

export function ProfileSkeleton() {
  return (
    <CollapsibleHeader
      expandedHeight={250}
      collapsedHeight={48}
      overlap={200}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      collapsedHeader={<CollapsedHeaderSkeleton />}
      persistentHeader={<PersistentHeaderSkeleton />}
      backgroundImage={images.stadium}
    >
      <View className="gap-6">
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
            <View key={index} className={index < 5 ? 'border-b border-border' : ''}>
              <DetailRowSkeleton />
            </View>
          ))}
        </View>

        <View>
          <TextSkeleton className="mb-3 h-6 w-36" />
          <View className="flex-row gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <View
                key={index}
                className="flex-1 items-center rounded-2xl border border-border bg-surface px-2 py-3"
              >
                <Skeleton className="mb-2 h-10 w-10 rounded-full" />
                <TextSkeleton className="w-16" />
                <TextSkeleton className="mt-2 h-3 w-full" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </CollapsibleHeader>
  );
}
