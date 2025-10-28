import { Screen } from '@/components/ui';
import { View } from 'react-native';

export default function SkeletonStats() {
  return (
    <Screen>
      <View className="flex-1 p-4 gap-4">
        {/* HEADER CARD */}

        {/* 2x2 STATS GRID */}
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              className="w-[48%] h-24 bg-surface rounded-2xl p-3 my-2 "
            >
              <View className="h-5 w-20 bg-border animate-pulse rounded my-2" />
              <View className="h-5 w-10 bg-border animate-pulse rounded " />
            </View>
          ))}
        </View>

        {/* PREDICTION RESULTS */}
        <View className="bg-surface rounded-2xl p-4 ">
          <View className="h-4 w-40 bg-border animate-pulse rounded" />
          <View className="h-6 w-full bg-border animate-pulse rounded my-3" />

          <View className=" flex-row justify-between w-full my-1 ">
            <View className="h-5  w-20 bg-border animate-pulse rounded px-2  " />
            <View className="h-5 w-20 bg-border animate-pulse rounded px-2 " />
            <View className="h-5 w-20 bg-border animate-pulse rounded px-2 " />
          </View>
        </View>

        {/* BINGO & REGULAR HITS */}
        <View className="bg-surface rounded-2xl py-6 px-4">
          <View className="h-4 w-32 bg-border animate-pulse rounded my-2" />
          <View className="h-6 w-12 bg-border animate-pulse rounded" />
        </View>
        <View className="bg-surface rounded-2xl py-6 px-4">
          <View className="h-4 w-32 bg-border animate-pulse rounded my-2" />
          <View className="h-6 w-12 bg-border animate-pulse rounded" />
        </View>
      </View>
    </Screen>
  );
}
