import { Screen } from '@/components/ui';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TopThreeSkeleton = () => {
  return (
    <View className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] p-4">
      <AnimatedSkeleton style={{ width: 60, height: 14, marginBottom: 16, borderRadius: 4 }} />
      <View className="flex-row items-end justify-center gap-3">
        <View className="flex-1 items-center">
          <AnimatedSkeleton style={{ width: 58, height: 58, borderRadius: 29, marginBottom: 24 }} />
          <AnimatedSkeleton style={{ width: 64, height: 12, borderRadius: 4 }} />
        </View>
        <View className="flex-1 items-center -mt-4">
          <AnimatedSkeleton style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 24 }} />
          <AnimatedSkeleton style={{ width: 72, height: 12, borderRadius: 4 }} />
        </View>
        <View className="flex-1 items-center">
          <AnimatedSkeleton style={{ width: 58, height: 58, borderRadius: 29, marginBottom: 24 }} />
          <AnimatedSkeleton style={{ width: 64, height: 12, borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );
};

const LeaderboardCardSkeleton = () => {
  return (
    <View className="mx-3 mb-1.5 flex-row items-center rounded-xl bg-[#0D1524] px-2 py-2.5">
      <AnimatedSkeleton style={{ width: 16, height: 14, borderRadius: 4 }} />
      <View className="ml-2 flex-1 flex-row items-center gap-2">
        <AnimatedSkeleton style={{ width: 28, height: 28, borderRadius: 14 }} />
        <AnimatedSkeleton style={{ height: 14, flex: 1, borderRadius: 4 }} />
      </View>
      <AnimatedSkeleton style={{ width: 48, height: 14, borderRadius: 4, marginLeft: 8 }} />
      <AnimatedSkeleton style={{ width: 24, height: 14, borderRadius: 4, marginLeft: 8 }} />
      <AnimatedSkeleton style={{ width: 16, height: 14, borderRadius: 4, marginLeft: 8 }} />
    </View>
  );
};

export default function LeagueSkeleton() {
  const insets = useSafeAreaInsets();
  const skeletonCards = Array.from({ length: 7 });

  return (
    <Screen>
      <View style={{ paddingTop: insets.top }} className="px-4 pb-2 pt-1">
        <AnimatedSkeleton style={{ width: 120, height: 28, borderRadius: 6, marginBottom: 6 }} />
        <AnimatedSkeleton style={{ width: 80, height: 14, borderRadius: 4 }} />
      </View>

      <View className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] px-4 py-3">
        <View className="flex-row items-center justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} className="flex-1 items-center">
              <AnimatedSkeleton style={{ width: 40, height: 20, borderRadius: 4, marginBottom: 4 }} />
              <AnimatedSkeleton style={{ width: 56, height: 10, borderRadius: 4 }} />
            </View>
          ))}
        </View>
      </View>

      <TopThreeSkeleton />

      <View className="mx-3 mb-2 flex-row px-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <AnimatedSkeleton
            key={i}
            style={{ flex: i === 1 ? 2 : 1, height: 10, borderRadius: 4, marginHorizontal: 2 }}
          />
        ))}
      </View>

      <View>
        {skeletonCards.map((_, index) => (
          <LeaderboardCardSkeleton key={`skeleton-card-${index}`} />
        ))}
      </View>
    </Screen>
  );
}
