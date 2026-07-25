import { Text } from '@/components/ui/Text';
import { LeaderboardMember } from '@/features/members/types/member.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Crown } from 'lucide-react-native';
import { View } from 'react-native';

import { AvatarImage, HeaderBackground } from '@/components/ui';
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
  const positionColor = getPositionColor(position, colors);
  const avatarSize = position === 1 ? 72 : 60;

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
            borderColor: positionColor,
          }}
        >
          <AvatarImage path={member?.avatar_url} nickname={member?.nickname} />
        </View>
      </View>

      <Text caption semibold numberOfLines={1} className=" w-full text-center">
        {member?.nickname}
      </Text>

      <View className="mb-2  items-center rounded px-2.5 p-0.5" style={{ backgroundColor: positionColor }}>
        <Text small semibold className="text-background">
          {member?.total_points ?? 0} pts
        </Text>
      </View>

      <View
        className="w-full items-center justify-center "
        style={{
          height: podiumHeight,
          backgroundColor: colors.surface + '97',
          borderColor: colors.border,
          borderWidth: 1,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        }}
      >
        <Text title font="teko-bold" className="pt-1 text-muted">
          {position}
        </Text>
      </View>
    </View>
  );
}
export function Podium({ first, second, third }: PodiumProps) {
  return (
    <View className="mx-2 mb-8 overflow-hidden rounded-md border border-border">
      <HeaderBackground>
        <View className="flex-row items-end justify-center pt-8">
          <PodiumMember member={second} position={2} podiumHeight={55} />

          <PodiumMember member={first} position={1} podiumHeight={75} />

          <PodiumMember member={third} position={3} podiumHeight={45} />
        </View>
      </HeaderBackground>
    </View>
  );
}
