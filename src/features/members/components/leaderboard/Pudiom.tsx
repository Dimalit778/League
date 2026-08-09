import { AvatarImage, Text } from '@/components';
import { LeaderboardMember } from '@/features/members/types/member.type';
import { useTranslation } from '@/hooks/useTranslation';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PodiumCrown, PodiumHexBadge } from './PodiumInsignia';

type Position = 1 | 2 | 3;

type PodiumProps = {
  first?: LeaderboardMember;
  second?: LeaderboardMember;
  third?: LeaderboardMember;
};

type PodiumMemberProps = {
  member?: LeaderboardMember;
  position: Position;
};

const METAL: Record<Position, string> = {
  1: '#F5C24B', // gold
  2: '#C2CAD6', // silver
  3: '#CE8E52', // bronze
};

const AVATAR_SIZE: Record<Position, number> = { 1: 78, 2: 62, 3: 62 };
const PEDESTAL_HEIGHT: Record<Position, number> = { 1: 128, 2: 108, 3: 94 };

function PodiumMember({ member, position }: PodiumMemberProps) {
  const { t } = useTranslation();
  const color = METAL[position];
  const avatarSize = AVATAR_SIZE[position];
  const displayName = member?.user_id ? (member.nickname ?? '') : t('Deleted Player');
  const memberId = member?.member_id;

  const avatar = (
    <View className="relative items-center">
      {position === 1 ? (
        <View className="absolute -top-8 z-20" style={{ transform: [{ rotate: '-6deg' }] }}>
          <PodiumCrown size={48} />
        </View>
      ) : null}

      <View
        className="items-center justify-center overflow-hidden rounded-full border-[3px] bg-surface"
        style={{
          width: avatarSize,
          height: avatarSize,
          borderColor: color,
          shadowColor: color,
          shadowOpacity: position === 1 ? 0.55 : 0.3,
          shadowRadius: position === 1 ? 14 : 8,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <AvatarImage path={member?.avatar_url} nickname={member?.nickname ?? ''} />
      </View>

      <View className="absolute -bottom-3 z-10">
        <PodiumHexBadge position={position} size={28} />
      </View>
    </View>
  );

  return (
    <View className="min-w-0 flex-1 items-center justify-end" style={styles.column}>
      {memberId ? (
        <View style={styles.avatarLayer}>
          <Link href={{ pathname: '/(app)/(league)/member/[memberId]', params: { memberId } }} asChild>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('{{name}}, position {{position}}, {{points}} points', {
                name: displayName,
                position,
                points: member?.total_points ?? 0,
              })}
            >
              {avatar}
            </TouchableOpacity>
          </Link>
        </View>
      ) : null}

      {/* Pedestal — holds the name + points on its face */}
      <View
        className="w-full items-center overflow-hidden rounded-t-xl border border-b-0 border-white/5 px-1"
        style={{ height: PEDESTAL_HEIGHT[position], borderTopColor: color, borderTopWidth: 3, paddingTop: 22 }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)', 'rgba(3,11,24,0.35)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        {memberId ? (
          <>
            <Text
              variant={position === 1 ? 'subtitle' : 'body'}
              numberOfLines={1}
              ellipsizeMode="tail"
              className="w-full text-center font-semibold text-white"
            >
              {displayName}
            </Text>
            <Text variant="subtitle" numberOfLines={1} ellipsizeMode="tail" style={{ color }}>
              {member?.total_points ?? 0} {t('pts')}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

export function Podium({ first, second, third }: PodiumProps) {
  return (
    <View className="mt-3 mb-4 overflow-hidden rounded-3xl border border-white/10">
      <View className="flex-row items-end justify-center gap-1.5 px-3 pt-10">
        <PodiumMember member={second} position={2} />
        <PodiumMember member={first} position={1} />
        <PodiumMember member={third} position={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { width: '100%' },
  column: { maxWidth: 118 },
  avatarLayer: { zIndex: 20 },
});
