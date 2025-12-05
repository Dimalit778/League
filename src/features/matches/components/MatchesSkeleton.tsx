import { useThemeTokens } from '@/hooks/useThemeTokens';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { FlatList, View } from 'react-native';

const TEAM_LOGO_SIZE = 32;
const skeletonItems = Array.from({ length: 12 });

const SkeletonMatchCard = () => {
  const { colors } = useThemeTokens();

  return (
    <View
      className="flex-1 m-1.5 rounded-md border"
      style={{
        backgroundColor: hexToRgba(colors.surface, 0.8),
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      {/* Header: Date on left, Status/Time on right */}
      <View className="flex-row items-center justify-between p-1 px-2">
        <AnimatedSkeleton style={{ height: 12, width: 60 }} />
        <AnimatedSkeleton style={{ height: 12, width: 30 }} />
      </View>

      {/* Teams and Score Section */}
      <View className="flex-row py-3">
        {/* Home Team */}
        <View className="flex-1 items-center">
          <AnimatedSkeleton
            style={{
              width: TEAM_LOGO_SIZE,
              height: TEAM_LOGO_SIZE,
              borderRadius: TEAM_LOGO_SIZE / 2,
              marginBottom: 4,
            }}
          />
          <AnimatedSkeleton style={{ height: 10, width: 40 }} />
        </View>

        {/* Center: Score or Button */}
        <View className="items-center justify-center">
          <AnimatedSkeleton
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
            }}
          />
        </View>

        {/* Away Team */}
        <View className="flex-1 items-center">
          <AnimatedSkeleton
            style={{
              width: TEAM_LOGO_SIZE,
              height: TEAM_LOGO_SIZE,
              borderRadius: TEAM_LOGO_SIZE / 2,
              marginBottom: 4,
            }}
          />
          <AnimatedSkeleton style={{ height: 10, width: 40 }} />
        </View>
      </View>

      {/* Prediction Status Section */}
      <View className="flex-1 bg-surface border-t border-border px-2 rounded-b-md py-2">
        <View className="flex-row items-center justify-center">
          <AnimatedSkeleton style={{ height: 12, width: 80 }} />
        </View>
      </View>
    </View>
  );
};

export default function SkeletonMatches() {
  return (
    <FlatList
      data={skeletonItems}
      numColumns={2}
      keyExtractor={(_, i) => `member-match-skeleton-${i}`}
      scrollEnabled={false}
      renderItem={({ index }) => <SkeletonMatchCard />}
      style={{ paddingTop: 10 }}
    />
  );
}
