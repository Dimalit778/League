import { Screen, useFloatBottomTabsInset } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { View } from 'react-native';

function Bone({
  width,
  height,
  borderRadius = 4,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const { colors } = useThemeTokens();
  return (
    <Skeleton
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

function PodiumMemberSkeleton({ avatarSize, podiumHeight }: { avatarSize: number; podiumHeight: number }) {
  const { colors } = useThemeTokens();

  return (
    <View className="min-w-0 flex-1 items-center" style={{ maxWidth: 112 }}>
      <Bone width={avatarSize} height={avatarSize} borderRadius={avatarSize / 2} />
      <Bone width={64} height={12} style={{ marginTop: 8 }} />
      <Bone width={48} height={18} borderRadius={999} style={{ marginTop: 6, marginBottom: 8 }} />
      <View
        className="w-full items-center justify-center"
        style={{
          height: podiumHeight,
          backgroundColor: colors.surface + 'B8',
          borderColor: colors.border,
          borderWidth: 1,
          borderTopWidth: 3,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        }}
      />
    </View>
  );
}

function PodiumSkeleton() {
  return (
    <View className="mx-4 mt-4 mb-8 overflow-hidden rounded-xl border border-border bg-subtle">
      <View className="flex-row items-end justify-center px-2 pt-9">
        <PodiumMemberSkeleton avatarSize={60} podiumHeight={55} />
        <PodiumMemberSkeleton avatarSize={72} podiumHeight={75} />
        <PodiumMemberSkeleton avatarSize={60} podiumHeight={45} />
      </View>
    </View>
  );
}

function LeaderboardRowSkeleton() {
  return (
    <View className="flex-row items-center px-3 py-2">
      <View className="w-10 items-center">
        <Bone width={28} height={28} borderRadius={6} />
      </View>
      <View className="mx-3">
        <Bone width={44} height={44} borderRadius={22} />
      </View>
      <View className="min-w-0 flex-1">
        <Bone width="70%" height={14} />
      </View>
      <View className="items-end gap-1">
        <Bone width={36} height={14} />
        <Bone width={40} height={10} />
      </View>
    </View>
  );
}

export default function LeaderboardSkeleton() {
  const bottomTabsInset = useFloatBottomTabsInset();

  return (
    <Screen scroll padding="horizontal" bottomInset={bottomTabsInset}>
      <PodiumSkeleton />

      <View className="mx-2 rounded-md border border-border bg-surface">
        {Array.from({ length: 6 }).map((_, index) => (
          <LeaderboardRowSkeleton key={index} />
        ))}
      </View>
    </Screen>
  );
}
