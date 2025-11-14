import { Card } from '@/components/ui';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { FlatList, View } from 'react-native';

const COMPACT_TEAM_LOGO_SIZE = 32;
const skeletonItems = Array.from({ length: 8 });
const SkeletonMatchCard = () => {
  return (
    <Card className="mx-2 my-1">
      <View className="flex-row justify-between items-center py-2.5 px-2">
        <View className="flex-1 items-center">
          <AnimatedSkeleton
            style={{
              width: COMPACT_TEAM_LOGO_SIZE,
              height: COMPACT_TEAM_LOGO_SIZE,
              borderRadius: COMPACT_TEAM_LOGO_SIZE / 2,
              marginBottom: 6,
            }}
          />
          <AnimatedSkeleton style={{ height: 12, width: 60 }} />
        </View>

        <View className="min-w-[60px] max-w-[80px] flex-1 items-center justify-center gap-1">
          <AnimatedSkeleton
            style={{ height: 20, width: 50, borderRadius: 6 }}
          />
          <AnimatedSkeleton
            style={{ height: 24, width: 60, borderRadius: 4 }}
          />
        </View>

        <View className="flex-1 items-center">
          <AnimatedSkeleton
            style={{
              width: COMPACT_TEAM_LOGO_SIZE,
              height: COMPACT_TEAM_LOGO_SIZE,
              borderRadius: COMPACT_TEAM_LOGO_SIZE / 2,
              marginBottom: 6,
            }}
          />
          <AnimatedSkeleton style={{ height: 12, width: 60 }} />
        </View>
      </View>
    </Card>
  );
};

export default function SkeletonMatches() {
  return (
    <FlatList
      data={skeletonItems}
      keyExtractor={(_, i) => `member-match-skeleton-${i}`}
      scrollEnabled={false}
      renderItem={() => <SkeletonMatchCard />}
      style={{ paddingTop: 10 }}
    />
  );
}
