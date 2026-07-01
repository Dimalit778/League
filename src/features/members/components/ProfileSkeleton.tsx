import { Screen } from '@/components/layout';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ProfileSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background px-3">
        {/* Header skeleton */}
        <View className="flex-row items-center justify-between px-1 py-3">
          <View>
            <View className="mb-2 h-7 w-28 animate-pulse rounded bg-[#1A2740]" />
            <View className="h-4 w-16 animate-pulse rounded bg-[#1A2740]" />
          </View>
          <View className="h-12 w-12 animate-pulse rounded-full bg-[#1A2740]" />
        </View>

        {/* Hero card skeleton */}
        <View className="mt-1 overflow-hidden rounded-3xl border border-[#223554] bg-[#101A2A] p-4">
          <View className="flex-row items-center gap-4">
            <View className="h-24 w-24 animate-pulse rounded-full bg-[#1A2740]" />
            <View className="flex-1 gap-2">
              <View className="h-6 w-36 animate-pulse rounded bg-[#1A2740]" />
              <View className="h-4 w-28 animate-pulse rounded bg-[#1A2740]" />
              <View className="h-4 w-24 animate-pulse rounded bg-[#1A2740]" />
            </View>
          </View>
          <View className="mt-5 h-16 animate-pulse rounded-2xl bg-[#1A2740]" />
        </View>

        {/* Nickname skeleton */}
        <View className="mt-3 h-16 animate-pulse rounded-xl border border-[#223554] bg-[#101A2A]" />

        {/* League details skeleton */}
        <View className="mt-4 overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] p-4">
          <View className="mb-3 h-5 w-32 animate-pulse rounded bg-[#1A2740]" />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="mb-3 flex-row justify-between">
              <View className="h-4 w-24 animate-pulse rounded bg-[#1A2740]" />
              <View className="h-4 w-20 animate-pulse rounded bg-[#1A2740]" />
            </View>
          ))}
        </View>

        {/* Achievements skeleton */}
        <View className="mt-5">
          <View className="mb-3 h-5 w-36 animate-pulse rounded bg-[#1A2740]" />
          <View className="flex-row gap-2">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-28 flex-1 animate-pulse rounded-2xl bg-[#101A2A] border border-[#223554]" />
            ))}
          </View>
        </View>

        {/* Actions skeleton */}
        <View className="mt-5 h-44 animate-pulse rounded-2xl border border-[#223554] bg-[#101A2A]" />
      </View>
    </Screen>
  );
}
