import { ScrollView, View } from 'react-native';

export default function SkeletonStats() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-4"
      >
        {/* First row: Total Predictions & Total Points */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2 bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-24 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-16 bg-border animate-pulse rounded mb-1" />
          </View>
          <View className="flex-1 ml-2 bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-20 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-16 bg-border animate-pulse rounded mb-1" />
          </View>
        </View>

        {/* Second row: Accuracy & Avg. Points */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2 bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-20 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-12 bg-border animate-pulse rounded mb-1" />
            <View className="h-3 w-32 bg-border animate-pulse rounded mt-1" />
          </View>
          <View className="flex-1 ml-2 bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-24 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-12 bg-border animate-pulse rounded mb-1" />
            <View className="h-3 w-28 bg-border animate-pulse rounded mt-1" />
          </View>
        </View>

        {/* Prediction Chart */}
        <View className="bg-surface border border-border rounded-lg p-4 mb-4">
          <View className="h-6 w-40 bg-border animate-pulse rounded mb-4" />
          <View className="h-6 flex-row rounded-md overflow-hidden mb-4">
            <View className="flex-1 bg-border animate-pulse" />
          </View>
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-border animate-pulse mr-2" />
              <View className="h-4 w-16 bg-border animate-pulse rounded" />
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-border animate-pulse mr-2" />
              <View className="h-4 w-20 bg-border animate-pulse rounded" />
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-border animate-pulse mr-2" />
              <View className="h-4 w-16 bg-border animate-pulse rounded" />
            </View>
          </View>
        </View>

        {/* Bingo Hits */}
        <View className="mb-4">
          <View className="bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-24 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-12 bg-border animate-pulse rounded mb-1" />
            <View className="h-3 w-48 bg-border animate-pulse rounded mt-1" />
          </View>
        </View>

        {/* Regular Hits */}
        <View className="mb-4">
          <View className="bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-28 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-12 bg-border animate-pulse rounded mb-1" />
            <View className="h-3 w-56 bg-border animate-pulse rounded mt-1" />
          </View>
        </View>

        {/* Missed */}
        <View className="mb-4">
          <View className="bg-surface border border-border rounded-lg p-4">
            <View className="h-4 w-20 bg-border animate-pulse rounded mb-2" />
            <View className="h-8 w-12 bg-border animate-pulse rounded mb-1" />
            <View className="h-3 w-44 bg-border animate-pulse rounded mt-1" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
