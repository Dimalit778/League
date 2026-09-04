import { images } from '@/assets/images';
import { AvatarImage, Text } from '@/components';
import { LeaderboardMember } from '@/features/members/types/member.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { setColorAlpha } from '@/lib/color';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { PodiumCrown, PodiumHexBadge } from './PodiumInsignia';

type Position = 1 | 2 | 3;

type PodiumProps = {
  first?: LeaderboardMember;
  second?: LeaderboardMember;
  third?: LeaderboardMember;
  clickable?: boolean;
};

type PodiumMemberProps = {
  member?: LeaderboardMember;
  position: Position;
  clickable: boolean;
};

const METAL: Record<Position, string> = {
  1: '#F5C24B', // gold
  2: '#C2CAD6', // silver
  3: '#CE8E52', // bronze
};

const AVATAR_SIZE: Record<Position, number> = { 1: 64, 2: 52, 3: 52 };
const PEDESTAL_HEIGHT: Record<Position, number> = { 1: 104, 2: 88, 3: 76 };

function PodiumMember({ member, position, clickable }: PodiumMemberProps) {
  const { t } = useTranslation();
  const color = METAL[position];
  const avatarSize = AVATAR_SIZE[position];
  const displayName = member?.user_id ? (member.nickname ?? '') : t('Deleted Player');
  const memberId = member?.member_id;

  const avatar = (
    <View className="relative items-center">
      {position === 1 ? (
        <View className="absolute -top-6 z-20" style={{ transform: [{ rotate: '-6deg' }] }}>
          <PodiumCrown size={40} />
        </View>
      ) : null}

      <View
        className="items-center justify-center overflow-hidden rounded-full border-[3px] "
        style={{
          width: avatarSize,
          height: avatarSize,
          borderColor: color,
          boxShadow: `0 0 ${position === 1 ? 14 : 8}px ${setColorAlpha(color, position === 1 ? 0.55 : 0.3)}`,
        }}
      >
        <AvatarImage path={member?.avatar_url} nickname={member?.nickname ?? ''} />
      </View>

      <View className="absolute -bottom-3 z-10">
        <PodiumHexBadge position={position} size={24} />
      </View>
    </View>
  );

  return (
    <View className="min-w-0 flex-1 items-center justify-end " style={styles.column}>
      {memberId ? (
        <View style={styles.avatarLayer}>
          {clickable ? (
            <Link href={{ pathname: '/(app)/(league)/member/[memberId]', params: { memberId } }} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={t('View {{name}} profile', { name: displayName })}
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                {avatar}
              </Pressable>
            </Link>
          ) : (
            avatar
          )}
        </View>
      ) : null}

      {/* Pedestal — glows in the medal's own metal, holding the name + points */}
      <View
        className="w-full items-center overflow-hidden rounded-t-xl border border-b-0 px-2 bg-surface"
        style={{
          height: PEDESTAL_HEIGHT[position],
          borderColor: setColorAlpha(color, 0.22),
          borderTopColor: color,
          borderTopWidth: 3,
          paddingTop: 18,
        }}
      >
        <LinearGradient
          colors={[setColorAlpha(color, position === 1 ? 0.32 : 0.24), setColorAlpha(color, 0.08), 'rgba(3,11,24,0.4)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        {memberId ? (
          <>
            <Text
              size={position === 1 ? '2xl' : 'lg'}
              weight={position === 1 ? 'sportBold' : 'sport'}
              numberOfLines={1}
              ellipsizeMode="tail"
              className="w-full text-center uppercase tracking-wide"
            >
              {displayName}
            </Text>
            <View
              className=" rounded-full px-3 py-0.5"
              style={{
                backgroundColor: setColorAlpha(color, 0.16),
                borderWidth: 1,
                borderColor: setColorAlpha(color, 0.3),
              }}
            >
              <Text
                variant="title"
                size={position === 1 ? 'lg' : 'base'}
                numberOfLines={1}
                ellipsizeMode="tail"
                className="font-bold"
                style={{ color }}
              >
                {member?.total_points ?? 0} {t('pts')}
              </Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

export function Podium({ first, second, third, clickable = true }: PodiumProps) {
  const { colors } = useThemeTokens();

  return (
    <View className="relative overflow-hidden border-b border-border">
      <Image source={images.bgStadium} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: setColorAlpha(colors.background, 0.55) }]}
      />
      <View className="flex-row items-end justify-center gap-1.5 px-3 pt-6">
        <PodiumMember member={second} position={2} clickable={clickable} />
        <PodiumMember member={first} position={1} clickable={clickable} />
        <PodiumMember member={third} position={3} clickable={clickable} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { maxWidth: 118 },
  avatarLayer: { zIndex: 20 },
});
