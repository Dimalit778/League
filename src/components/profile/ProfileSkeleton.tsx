import { View } from 'react-native';

export function ProfileSkeleton() {
  return (
    <View className="flex-1 bg-background">
      {/* Avatar section skeleton */}
      <View className="px-4 mt-4">
        <View className="items-center px-4">
          <View className="relative mb-4">
            <View className="w-40 h-40 bg-muted rounded-full animate-pulse" />
          </View>
        </View>
      </View>

      {/* Nickname section skeleton */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center justify-between bg-surface rounded-lg px-4 py-5 border border-border">
          <View className="w-32 h-6 bg-muted rounded animate-pulse" />
          <View className="w-5 h-5 bg-muted rounded animate-pulse" />
        </View>
      </View>

      {/* League details skeleton */}
      <View className="flex-grow justify-center px-4 ">
        <View className="bg-surface rounded-2xl border border-border p-4">
          {/* League header skeleton */}
          <View className="flex-row items-center px-4">
            {/* Competition logo skeleton */}
            <View className="w-10 h-10 bg-muted rounded-xl mr-3 animate-pulse" />

            {/* League name skeleton - centered */}
            <View className="flex-1 items-end">
              <View className="w-28 h-6 bg-muted rounded animate-pulse" />
            </View>
          </View>

          <View className="h-[1px] bg-muted my-3" />

          {/* League details skeleton */}
          <View className="gap-3">
            {/* Join Code skeleton */}
            <View className="flex-row items-center justify-between">
              <View className="w-20 h-4 bg-muted rounded animate-pulse" />
              <View className="w-24 h-8 bg-muted rounded-lg border border-border animate-pulse" />
            </View>

            <View className="h-[1px] bg-border" />

            {/* Members skeleton */}
            <View className="flex-row justify-between">
              <View className="w-16 h-4 bg-muted rounded animate-pulse" />
              <View className="w-16 h-4 bg-muted rounded animate-pulse" />
            </View>

            <View className="h-[1px] bg-border" />

            {/* Owner skeleton */}
            <View className="flex-row justify-between">
              <View className="w-24 h-4 bg-muted rounded animate-pulse" />
              <View className="w-20 h-4 bg-muted rounded animate-pulse" />
            </View>

            <View className="h-[1px] bg-border" />

            {/* Competition details skeleton */}
            <View className="flex-row justify-between">
              <View className="w-12 h-4 bg-muted rounded animate-pulse" />
              <View className="flex-row items-center">
                <View className="w-20 h-4 bg-muted rounded mr-2 animate-pulse" />
                <View className="w-[18px] h-[18px] bg-muted rounded animate-pulse" />
              </View>
            </View>

            <View className="h-[1px] bg-border" />

            {/* Country skeleton */}
            <View className="flex-row justify-between items-center">
              <View className="w-14 h-4 bg-muted rounded animate-pulse" />
              <View className="flex-row items-center">
                <View className="w-20 h-4 bg-muted rounded mr-2 animate-pulse" />
                <View className="w-[18px] h-[18px] bg-muted rounded animate-pulse" />
              </View>
            </View>

            <View className="h-[1px] bg-border" />

            {/* Created date skeleton */}
            <View className="flex-row justify-between">
              <View className="w-20 h-4 bg-muted rounded animate-pulse" />
              <View className="w-24 h-4 bg-muted rounded animate-pulse" />
            </View>
          </View>
        </View>
      </View>

      {/* Leave League Button skeleton */}
      <View className="px-6  mb-4">
        <View className="w-full h-12 bg-muted rounded-lg animate-pulse" />
      </View>
    </View>
  );
}
