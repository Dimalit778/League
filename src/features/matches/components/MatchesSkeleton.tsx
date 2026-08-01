import { getMatchCardMetrics, MatchCardBg } from '@/features/matches/components/MatchCardBg';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Skeleton } from '@/components/ui';
import { useWindowDimensions, View } from 'react-native';

const SKELETON_COUNT = 6;

type MatchesSkeletonProps = {
  count?: number;
  bottomInset?: number;
};

export const MatchCardSkeleton = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useThemeTokens();
  const {
    width: cardWidth,
    height: cardHeight,
    gap,
    centerWidth,
    teamWidth,
    contentHeight,
    contentTop: mainContentTop,
    headerTop,
    predictionTop,
    logoBoxSize,
  } = getMatchCardMetrics(screenWidth);

  const boneColor = colors.border;

  return (
    <View className="mb-2 w-full items-center">
      <View style={{ width: cardWidth, height: cardHeight }}>
        <View className="absolute inset-0">
          <MatchCardBg width={cardWidth} height={cardHeight} />
        </View>

        <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top: headerTop }}>
          <Skeleton
            style={{ width: cardWidth * 0.15, height: cardHeight * 0.1, borderRadius: 5, backgroundColor: boneColor }}
          />
        </View>

        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{ top: mainContentTop, height: contentHeight, gap }}
        >
          <View style={{ width: teamWidth }} className="items-center gap-1.5">
            <Skeleton
              style={{
                width: logoBoxSize,
                height: logoBoxSize,
                borderRadius: logoBoxSize / 2,
                backgroundColor: boneColor,
              }}
            />
            <Skeleton
              style={{ width: teamWidth * 0.5, height: cardHeight * 0.12, borderRadius: 4, backgroundColor: boneColor }}
            />
          </View>

          <View style={{ width: centerWidth }} className="items-center justify-center">
            <Skeleton style={{ width: 40, height: 24, borderRadius: 6, backgroundColor: boneColor }} />
          </View>

          <View style={{ width: teamWidth }} className="items-center gap-1.5">
            <Skeleton
              style={{
                width: logoBoxSize,
                height: logoBoxSize,
                borderRadius: logoBoxSize / 2,
                backgroundColor: boneColor,
              }}
            />
            <Skeleton
              style={{
                width: teamWidth * 0.6,
                height: cardHeight * 0.12,
                borderRadius: 4,
                backgroundColor: boneColor,
              }}
            />
          </View>
        </View>

        <View className="absolute left-0 right-0 z-10 items-center" style={{ top: predictionTop }}>
          <Skeleton
            style={{ width: cardWidth * 0.13, height: cardHeight * 0.1, borderRadius: 5, backgroundColor: boneColor }}
          />
        </View>
      </View>
    </View>
  );
};

export default function MatchesSkeleton({ count = SKELETON_COUNT }: MatchesSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => (
        <MatchCardSkeleton key={item.toString()} />
      ))}
    </View>
  );
}
