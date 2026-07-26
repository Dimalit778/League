import { MATCH_CARD_LAYOUT, MATCH_CARD_VIEWBOX_HEIGHT, MatchCardBg } from '@/features/matches/components/MatchCardBg';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { FlatList, useWindowDimensions, View } from 'react-native';

const SKELETON_COUNT = 6;

type MatchesSkeletonProps = {
  count?: number;
  bottomInset?: number;
};

export const MatchCardSkeleton = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useThemeTokens();

  const cardWidth = screenWidth - 30;
  const cardHeight = Math.round(cardWidth * (MATCH_CARD_VIEWBOX_HEIGHT / 360) * 0.9);

  const gap = 8;
  const centerWidth = 72;
  const teamWidth = (cardWidth - gap * 2 - centerWidth) / 2;
  const contentHeight = cardHeight * (MATCH_CARD_LAYOUT.contentBottomY - MATCH_CARD_LAYOUT.contentTopY);
  const logoBoxSize = Math.min(teamWidth * 0.9, Math.round(cardHeight * 0.5), 58);
  const logoWidth = logoBoxSize;
  const logoHeight = logoBoxSize;

  const headerTop = cardHeight * MATCH_CARD_LAYOUT.dateTabCenterY - 10;
  const predictionTop = cardHeight * MATCH_CARD_LAYOUT.predictionTabCenterY - 6;
  const mainContentTop = cardHeight * MATCH_CARD_LAYOUT.contentTopY;

  const boneColor = colors.border;

  return (
    <View className="mb-2 w-full items-center bbg">
      <View style={{ width: cardWidth, height: cardHeight }}>
        <View className="absolute inset-0">
          <MatchCardBg width={cardWidth} height={cardHeight} />
        </View>

        <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top: headerTop }}>
          <AnimatedSkeleton
            style={{ width: cardWidth * 0.15, height: cardHeight * 0.1, borderRadius: 5, backgroundColor: 'boneColor' }}
          />
        </View>

        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{ top: mainContentTop, height: contentHeight, gap }}
        >
          <View style={{ width: teamWidth }} className="items-center gap-1.5">
            <AnimatedSkeleton
              style={{
                width: logoWidth,
                height: logoHeight,
                borderRadius: logoWidth / 2,
                backgroundColor: boneColor,
              }}
            />
            <AnimatedSkeleton
              style={{ width: teamWidth * 0.5, height: cardHeight * 0.12, borderRadius: 4, backgroundColor: boneColor }}
            />
          </View>

          <View style={{ width: centerWidth }} className="items-center justify-center">
            <AnimatedSkeleton style={{ width: 40, height: 24, borderRadius: 6, backgroundColor: boneColor }} />
          </View>

          <View style={{ width: teamWidth }} className="items-center gap-1.5">
            <AnimatedSkeleton
              style={{
                width: logoWidth,
                height: logoHeight,
                borderRadius: logoWidth / 2,
                backgroundColor: boneColor,
              }}
            />
            <AnimatedSkeleton
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
          <AnimatedSkeleton
            style={{ width: cardWidth * 0.13, height: cardHeight * 0.1, borderRadius: 5, backgroundColor: boneColor }}
          />
        </View>
      </View>
    </View>
  );
};

export default function MatchesSkeleton({ count = SKELETON_COUNT, bottomInset = 0 }: MatchesSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `match-skeleton-${item}`}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset + 20, flexGrow: 1 }}
      renderItem={() => <MatchCardSkeleton />}
    />
  );
}
