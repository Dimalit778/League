import { Card, Screen } from '@/components/ui';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { View } from 'react-native';

const TopThreeSkeleton = () => {
  return (
    <View className="flex-row justify-center gap-5 mb-4">
      {/* Second place */}
      <View className="items-center">
        <View className="relative">
          <AnimatedSkeleton
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        </View>
        <AnimatedSkeleton style={{ width: 60, height: 16, marginTop: 8 }} />
      </View>

      {/* First place */}
      <View className="items-center -mt-8">
        <View className="relative">
          <View className="absolute -top-7 left-1/2 transform -translate-x-1/2"></View>
          <AnimatedSkeleton
            style={{ width: 96, height: 96, borderRadius: 48 }}
          />
        </View>
        <AnimatedSkeleton style={{ width: 70, height: 16, marginTop: 8 }} />
      </View>

      {/* Third place */}
      <View className="items-center">
        <View className="relative">
          <AnimatedSkeleton
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        </View>
        <AnimatedSkeleton style={{ width: 60, height: 16, marginTop: 8 }} />
      </View>
    </View>
  );
};

const LeaderboardCardSkeleton = () => {
  return (
    <Card className="p-2 mx-3 my-1">
      <View className="flex-row items-center gap-3">
        {/* Position Badge */}
        <AnimatedSkeleton style={{ width: 32, height: 32, borderRadius: 16 }} />
        {/* Avatar */}
        <AnimatedSkeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
        {/* User Info */}
        <View className="flex-1">
          <AnimatedSkeleton style={{ height: 16, width: '80%' }} />
        </View>
        {/* Points Section */}
        <View className="items-center pr-2">
          <AnimatedSkeleton style={{ height: 24, width: 50 }} />
          <AnimatedSkeleton style={{ height: 12, width: 30, marginTop: 4 }} />
        </View>
      </View>
    </Card>
  );
};

const LeagueSkeleton = () => {
  const skeletonCards = Array.from({ length: 7 });

  return (
    <Screen>
      <TopThreeSkeleton />
      <View>
        {skeletonCards.map((_, index) => (
          <LeaderboardCardSkeleton key={`skeleton-card-${index}`} />
        ))}
      </View>
    </Screen>
  );
};

export default LeagueSkeleton;
