import { Text } from '@/components/ui/Text';
import { LeaderboardMember } from '@/features/members/types/member.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Crown } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import { AvatarImage, HeaderBackground } from '@/components/ui';
import { Link } from 'expo-router';
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
  const { t } = useTranslation();
  const positionColor = getPositionColor(position, colors);
  const avatarSize = position === 1 ? 72 : 60;
  const displayName = member?.user_id ? (member.nickname ?? '') : t('Deleted Player');
  const memberId = member?.member_id;

  return (
    <View className="min-w-0 flex-1 items-center" style={{ maxWidth: 112 }}>
      {memberId ? (
        <>
          <Link
            href={{
              pathname: '/(app)/(league)/member/[memberId]',
              params: { memberId },
            }}
            asChild
          >
            <TouchableOpacity
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('{{name}}, position {{position}}, {{points}} points', {
                name: displayName,
                position,
                points: member.total_points ?? 0,
              })}
            >
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
                  <AvatarImage path={member.avatar_url} nickname={displayName} />
                </View>
              </View>
            </TouchableOpacity>
          </Link>
          <Text variant="subtitle" numberOfLines={1} ellipsizeMode="tail" className="mt-1 w-full px-1 text-center">
            {displayName}
          </Text>

          <View className="mt-1 mb-2 items-center rounded-md px-2.5 py-0.5" style={{ backgroundColor: positionColor }}>
            <Text variant="caption" tone="inverse">
              {member.total_points ?? 0} {t('pts')}
            </Text>
          </View>
        </>
      ) : null}

      <View
        className="w-full items-center"
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
        <Text variant="display" style={{ color: positionColor }}>
          {position}
        </Text>
      </View>
    </View>
  );
}
export function Podium({ first, second, third }: PodiumProps) {
  return (
    <View className=" mt-4 mb-8 ">
      <HeaderBackground>
        <View className="flex-row items-end justify-center px-2 pt-9">
          <PodiumMember member={second} position={2} podiumHeight={70} />

          <PodiumMember member={first} position={1} podiumHeight={90} />

          <PodiumMember member={third} position={3} podiumHeight={60} />
        </View>
      </HeaderBackground>
    </View>
  );
}
