import { Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import AnimatedSkeleton from '@/utils/AnimatedSkeleton';
import { ScrollView, View } from 'react-native';

function Bone({ style }: { style: object }) {
  const { colors } = useThemeTokens();
  return <AnimatedSkeleton style={{ backgroundColor: colors.border, ...style }} />;
}

function DetailRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3">
        <Bone style={{ height: 32, width: 32, borderRadius: 8 }} />
        <Bone style={{ height: 14, width: 88 }} />
      </View>
      <Bone style={{ height: 14, width: 72 }} />
    </View>
  );
}

function MenuRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        <Bone style={{ height: 20, width: 20, borderRadius: 10 }} />
        <Bone style={{ height: 16, width: 112 }} />
      </View>
      <Bone style={{ height: 18, width: 18, borderRadius: 4 }} />
    </View>
  );
}

export function ProfileSkeleton() {
  const bottomTabsInset = useFloatBottomTabsInset();

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: bottomTabsInset + 16 }}
      >
        {/* ProfileHeroCard */}
        <View className="mx-3 mt-1 overflow-hidden rounded-3xl border border-border bg-surfaceSecondary">
          <View className="p-4">
            <View className="flex-row items-center gap-4">
              <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-surface">
                <Bone style={{ height: 88, width: 88, borderRadius: 44 }} />
              </View>

              <View className="min-w-0 flex-1 gap-2">
                <Bone style={{ height: 28, width: '70%', borderRadius: 6 }} />
                <View className="flex-row items-center gap-1.5">
                  <Bone style={{ height: 13, width: 13, borderRadius: 7 }} />
                  <Bone style={{ height: 14, width: '80%', borderRadius: 4 }} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ProfileNicknameEdit */}
        <View className="mx-3 mt-3 flex-row items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
          <View className="gap-2">
            <Bone style={{ height: 12, width: 56, borderRadius: 4 }} />
            <Bone style={{ height: 16, width: 120, borderRadius: 4 }} />
          </View>
          <Bone style={{ height: 14, width: 14, borderRadius: 4 }} />
        </View>

        {/* ProfileLeagueDetails */}
        <View className="mx-3 mt-4 overflow-hidden rounded-2xl border border-border bg-surface px-4">
          <View className="flex-row items-center gap-2 border-b border-border py-3">
            <Bone style={{ height: 18, width: 18, borderRadius: 9 }} />
            <Bone style={{ height: 16, width: 112, borderRadius: 4 }} />
          </View>

          <DetailRowSkeleton />
          <View className="h-px bg-border" />
          <DetailRowSkeleton />
          <View className="h-px bg-border" />
          <DetailRowSkeleton />
          <View className="h-px bg-border" />
          <DetailRowSkeleton />
        </View>

        {/* ProfileActionsMenu */}
        <View className="mx-3 mt-5 overflow-hidden rounded-2xl border border-border bg-surface px-4">
          <MenuRowSkeleton />
          <View className="h-px bg-border" />
          <MenuRowSkeleton />
        </View>

        <View className="mx-3 mt-4 items-center">
          <Bone style={{ height: 44, width: 148, borderRadius: 12 }} />
        </View>

        <View className="h-4" />
      </ScrollView>
    </Screen>
  );
}
