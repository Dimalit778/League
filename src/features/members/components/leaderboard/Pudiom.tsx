import { Text } from '@/components/ui/Text';
import { LeaderboardMember } from '@/features/members/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Crown } from 'lucide-react-native';
import { View } from 'react-native';

import { AvatarImage } from '@/components/ui';
type PodiumProps = {
  first?: LeaderboardMember;
  second?: LeaderboardMember;
  third?: LeaderboardMember;
};
type PodiumMemberProps = {
  member?: LeaderboardMember;
  position: 1 | 2 | 3;
  podiumHeight: number;
};
function getPositionColor(
  position: 1 | 2 | 3,
  colors: {
    primary: string;
    muted: string;
    error: string;
  },
) {
  if (position === 1) return colors.primary;
  if (position === 2) return '#AAB4C3';
  return '#C47A44';
}
function PodiumMember({ member, position, podiumHeight }: PodiumMemberProps) {
  const { colors } = useThemeTokens();

  const avatarSize = position === 1 ? 76 : 64;

  return (
    <View className="w-28 items-center">
      <View className="relative items-center">
        {position === 1 && (
          <View className="absolute -top-6 z-20">
            <Crown size={26} color={colors.primary} fill={colors.primary} />
          </View>
        )}

        <View
          className="items-center justify-center overflow-hidden rounded-full border-2 bg-surface"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderColor: getPositionColor(position, colors),
          }}
        >
          <AvatarImage path={member?.avatar_url} nickname={member?.nickname} />
        </View>

        <View
          className="absolute -bottom-2 h-7 w-7 items-center justify-center rounded-full border-2 border-background"
          style={{
            backgroundColor: getPositionColor(position, colors),
          }}
        >
          <Text bold className="text-xs text-background">
            {position}
          </Text>
        </View>
      </View>

      <Text semibold numberOfLines={1} className="mt-4 w-full text-center">
        {member?.nickname}
      </Text>

      <Text bold className="mt-1 text-primary">
        {member?.total_points} pts
      </Text>

      <View
        className="mt-3 w-full items-center justify-start rounded-t-2xl border border-border bg-surfaceSecondary px-2 pt-4"
        style={{
          height: podiumHeight,
        }}
      >
        <Text title font="teko-bold" className="text-muted">
          {position}
        </Text>
      </View>
    </View>
  );
}
export function Podium({ first, second, third }: PodiumProps) {
  // Crown sits at -top-6; pad so FlatList/TabsHeader don't clip it (zIndex can't float above nav header)
  return (
    <View className="flex-row items-end justify-center pt-8">
      <PodiumMember member={second} position={2} podiumHeight={93} />

      <PodiumMember member={first} position={1} podiumHeight={130} />

      <PodiumMember member={third} position={3} podiumHeight={70} />
    </View>
  );
}
