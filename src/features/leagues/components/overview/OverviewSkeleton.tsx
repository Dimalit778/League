import { Screen } from '@/components/layout';
import { MatchCardSkeleton } from '@/features/matches/components/MatchesSkeleton';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BoneProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
};

function Bone({ width, height, borderRadius = 4, style }: BoneProps) {
  const { colors } = useThemeTokens();

  return (
    <AnimatedSkeleton
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.border,
        ...style,
      }}
    />
  );
}

function HeaderSkeleton() {
  const { colors } = useThemeTokens();
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: top }} className="px-4 pb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View
          className="h-12 w-12 items-center justify-center rounded-full border"
          style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
        >
          <Bone width={25} height={25} borderRadius={7} />
        </View>
        <View
          className="h-12 w-12 items-center justify-center rounded-full border"
          style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
        >
          <Bone width={25} height={25} borderRadius={7} />
        </View>
      </View>

      <View
        className="mt-2 rounded-lg border px-1.5 py-4"
        style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
      >
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center gap-2">
            <View
              className="h-14 w-14 items-center justify-center rounded-full border-2 p-0.5"
              style={{ borderColor: colors.border }}
            >
              <Bone width={48} height={48} borderRadius={24} />
            </View>
            <View className="min-w-0 flex-1 gap-1.5">
              <Bone width="72%" height={18} borderRadius={5} />
              <Bone width="52%" height={11} />
            </View>
          </View>

          {[0, 1, 2].map((item) => (
            <View key={item} className="flex-row items-center">
              <View className="mx-0.5 h-14 w-px opacity-70" style={{ backgroundColor: colors.border }} />
              <View className="w-[52px] items-center justify-center gap-1.5">
                <Bone width={18} height={18} borderRadius={5} />
                <Bone width={34} height={9} />
                <Bone width={28} height={12} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function QuickAccessSkeleton() {
  const { colors } = useThemeTokens();

  return (
    <View className="mt-2 gap-3">
      <Bone width={96} height={14} borderRadius={5} />
      <View className="flex-row gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={index}
            className="flex-1 overflow-hidden rounded-2xl border p-1.5"
            style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
          >
            <View className="flex-row items-center p-1">
              <View className="min-w-0 flex-1 gap-2">
                <Bone width={30} height={30} borderRadius={8} />
                <Bone width="72%" height={11} />
              </View>
              <Bone width={10} height={20} borderRadius={5} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatsSkeleton() {
  const { colors } = useThemeTokens();

  return (
    <View className="mt-2 gap-3">
      <Bone width={48} height={14} borderRadius={5} />
      <View className="flex-row gap-2">
        <View
          className="overflow-hidden rounded-2xl border p-1.5"
          style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
        >
          <View className="items-center gap-3 p-1">
            <Bone width={54} height={11} />
            <Bone width={64} height={64} borderRadius={32} />
            <Bone width={86} height={11} />
          </View>
        </View>

        <View className="flex-1 gap-2">
          <View
            className="flex-1 overflow-hidden rounded-2xl border p-1.5"
            style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
          >
            <View className="flex-1 items-center justify-center gap-1.5 p-1">
              <Bone width={18} height={18} borderRadius={5} />
              <Bone width={82} height={10} />
              <Bone width={24} height={11} />
            </View>
          </View>

          <View className="flex-1 flex-row gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <View
                key={index}
                className="flex-1 overflow-hidden rounded-2xl border p-1.5"
                style={{ borderColor: colors.border, backgroundColor: colors.surfaceSoft }}
              >
                <View className="flex-1 items-center justify-center gap-1 p-1">
                  <Bone width={18} height={18} borderRadius={5} />
                  <Bone width="78%" height={9} />
                  <Bone width={18} height={10} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function UpcomingMatchesSkeleton() {
  return (
    <View className="mt-2 gap-3">
      <Bone width={104} height={14} borderRadius={5} />
      <MatchCardSkeleton />
    </View>
  );
}

export default function OverviewSkeleton() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Screen>
      <HeaderSkeleton />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-3 pt-3"
        style={{ paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
      >
        <QuickAccessSkeleton />
        <StatsSkeleton />
        <UpcomingMatchesSkeleton />
      </ScrollView>
    </Screen>
  );
}
