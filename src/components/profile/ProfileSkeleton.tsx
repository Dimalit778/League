import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ProfileSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Member avatar skeleton */}
      <View className=" items-center">
        <View className="relative">
          {/* Avatar skeleton */}
          <View className="w-[120px] h-[120px] bg-muted rounded-full animate-pulse" />
        </View>

        {/* Nickname skeleton */}
        <View className="w-32 h-6 bg-muted rounded mt-4 animate-pulse" />
      </View>

      {/* League details skeleton */}
      <View className="flex-grow justify-center px-4">
        <View className="bg-surface rounded-2xl border border-border p-4">
          {/* League header skeleton */}
          <View className="flex-row justify-between items-center px-4">
            {/* Competition logo skeleton */}
            <View className="w-10 h-10 bg-muted rounded-xl mr-3 animate-pulse" />

            {/* League name skeleton */}
            <View className="flex-1 h-6 bg-muted rounded mx-4 animate-pulse" />

            {/* Edit button skeleton */}
            <View className="w-4 h-4 bg-muted rounded animate-pulse" />
          </View>

          <View className="h-[1px] bg-muted my-3" />

          {/* League details skeleton */}
          <View className="gap-3">
            {/* Join Code skeleton */}
            <View className="flex-row items-center justify-between">
              <View className="w-20 h-4 bg-muted rounded animate-pulse" />
              <View className="w-24 h-8 bg-muted rounded-lg animate-pulse" />
            </View>

            <View className="h-[1px] bg-border" />

            {/* Members skeleton */}
            <View className="flex-row justify-between">
              <View className="w-16 h-4 bg-muted rounded animate-pulse" />
              <View className="w-12 h-4 bg-muted rounded animate-pulse" />
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
                <View className="w-16 h-4 bg-muted rounded mr-2 animate-pulse" />
                <View className="w-4 h-4 bg-muted rounded animate-pulse" />
              </View>
            </View>

            <View className="h-[1px] bg-border" />

            {/* Country skeleton */}
            <View className="flex-row justify-between items-center">
              <View className="w-14 h-4 bg-muted rounded animate-pulse" />
              <View className="flex-row items-center">
                <View className="w-16 h-4 bg-muted rounded mr-2 animate-pulse" />
                <View className="w-4 h-4 bg-muted rounded animate-pulse" />
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
      <View className="mt-auto mb-4 px-6">
        <View className="w-full h-12 bg-muted rounded-lg animate-pulse" />
      </View>
    </SafeAreaView>
  );
}
