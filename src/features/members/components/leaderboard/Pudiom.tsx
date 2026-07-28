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
    <View
      className="min-w-0 flex-1 items-center"
      style={{ maxWidth: 112 }}
      accessible={!!member}
      accessibilityLabel={
        member ? `${member.nickname}, position ${position}, ${member.total_points ?? 0} points` : undefined
      }
    >
      {member && (
        <>
          <View className="relative items-center">
            {position === 1 && (
              <View
                className="absolute -top-6 z-20"
                style={{
                  shadowColor: positionColor,
                  shadowOpacity: 0.35,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Crown size={26} color={colors.primary} fill={colors.primary} />
              </View>
            )}

            <View
              className="items-center justify-center overflow-hidden rounded-full border-[3px] bg-surface"
              style={{
                width: avatarSize,
                height: avatarSize,
                borderColor: positionColor,
              }}
            >
              <AvatarImage path={member.avatar_url} nickname={member.nickname} />
            </View>
          </View>

          <Text numberOfLines={1} ellipsizeMode="tail" className="text-sm font-semibold mt-1 w-full px-1 text-center">
            {member.nickname}
          </Text>

          <View
            className="mt-1 mb-2 items-center rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: positionColor }}
          >
            <Text style={{ color: '#0F172A' }} className="text-xs font-bold">
              {member.total_points ?? 0} pts
            </Text>
          </View>
        </>
      )}

      <View
        className="w-full items-center justify-center "
        style={{
          height: podiumHeight,
          backgroundColor: colors.surface + 'B8',
          borderColor: colors.border,
          borderWidth: 1,
          borderTopColor: positionColor,
          borderTopWidth: 3,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        }}
      >
        <Text font="teko-bold" style={{ color: positionColor }} className="text-5xl pt-1">
          {position}
        </Text>
      </View>
    </View>
  );
}
export function Podium({ first, second, third }: PodiumProps) {
  return (
    <View className="mx-4 mt-4 mb-8 overflow-hidden rounded-xl border border-border">
      <HeaderBackground>
        <View className="flex-row items-end justify-center px-2 pt-9">
          <PodiumMember member={second} position={2} podiumHeight={55} />

          <PodiumMember member={first} position={1} podiumHeight={75} />

          <PodiumMember member={third} position={3} podiumHeight={45} />
        </View>
      </HeaderBackground>
    </View>
  );
}
