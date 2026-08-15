import { Skeleton } from '@/components';
import { getMatchCardMetrics, MatchCardBg } from '@/features/matches/components/MatchCardBg';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SKELETON_COUNT = 6;
const FIXTURE_SKELETON_COUNT = 8;
const FIXTURE_WIDTH = 70;
const FIXTURE_HEIGHT = 36;

type MatchesSkeletonProps = {
  count?: number;
  bottomInset?: number;
  showFixtures?: boolean;
};

export function FixturesSkeleton({ count = FIXTURE_SKELETON_COUNT }: { count?: number }) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="shrink-0 grow-0"
      contentContainerStyle={{ paddingVertical: 3, paddingTop: 5 }}
    >
      {items.map((item) => (
        <View key={item} className="mx-2 items-center">
          <Skeleton className="rounded-xl bg-border" style={{ width: FIXTURE_WIDTH, height: FIXTURE_HEIGHT }} />
        </View>
      ))}
    </ScrollView>
  );
}

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

        <View className="absolute left-0 right-0 z-10 items-center pt-2" style={{ top: predictionTop }}>
          <Skeleton
            style={{ width: cardWidth * 0.13, height: cardHeight * 0.1, borderRadius: 5, backgroundColor: boneColor }}
          />
        </View>
      </View>
    </View>
  );
};

export function MatchesTopBarSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View className="w-full" style={{ paddingTop: insets.top }}>
      <View className="relative h-12 w-full justify-center px-2.5">
        <View className="absolute inset-0 items-center justify-center px-14">
          <Skeleton className="rounded-md bg-border" style={{ width: 96, height: 22 }} />
        </View>

        <View className="absolute z-10" style={{ end: 10, top: 0, width: 40, height: 40 }}>
          <Skeleton className="h-full w-full rounded-full bg-border" />
        </View>
      </View>
    </View>
  );
}

export default function MatchesSkeleton({
  count = SKELETON_COUNT,
  bottomInset = 0,
  showFixtures = true,
}: MatchesSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <View className="flex-1">
      <MatchesTopBarSkeleton />
      {showFixtures ? <FixturesSkeleton /> : null}

      <View className="gap-2.5 px-4" style={{ paddingBottom: bottomInset + 20 }}>
        {items.map((item) => (
          <MatchCardSkeleton key={item.toString()} />
        ))}
      </View>
    </View>
  );
}
