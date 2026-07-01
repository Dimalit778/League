import { AvatarImage, CText } from '@/components/ui';
import { LeaderboardRow } from '@/features/leagues/types';
import { useTranslation } from '@/hooks/useTranslation';
import stadiumBg from '@assets/images/fieldImage.jpg';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Star } from 'lucide-react-native';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

const GOLD = '#E3B421';
const SILVER = '#A8B4C4';
const BRONZE = '#C68A4A';

type TopThreeProps = {
  topMembers: LeaderboardRow[];
};

type PositionStyle = {
  size: number;
  ringColor: string;
  badgeBg: string;
  badgeText: string;
  pointsColor: string;
  elevation: number;
};

function getPositionStyle(position: number): PositionStyle {
  switch (position) {
    case 1:
      return {
        size: 72,
        ringColor: GOLD,
        badgeBg: GOLD,
        badgeText: '#081325',
        pointsColor: 'text-[#E3B421]',
        elevation: -16,
      };
    case 2:
      return {
        size: 58,
        ringColor: '#3D5A80',
        badgeBg: SILVER,
        badgeText: '#081325',
        pointsColor: 'text-white',
        elevation: 0,
      };
    default:
      return {
        size: 58,
        ringColor: '#5C4033',
        badgeBg: BRONZE,
        badgeText: '#081325',
        pointsColor: 'text-white',
        elevation: 0,
      };
  }
}

function PodiumPlayer({ member, position }: { member: LeaderboardRow | undefined; position: number }) {
  const { t } = useTranslation();
  const style = getPositionStyle(position);

  const content = (
    <View className="items-center" style={{ marginTop: style.elevation }}>
      <View
        className="mb-1 h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: style.badgeBg }}
      >
        <CText className="text-xs font-bold" style={{ color: style.badgeText }}>
          {position}
        </CText>
      </View>

      <View
        className="items-center justify-center rounded-full"
        style={{
          width: style.size,
          height: style.size,
          borderWidth: position === 1 ? 3 : 2,
          borderColor: style.ringColor,
          shadowColor: position === 1 ? GOLD : 'transparent',
          shadowOpacity: position === 1 ? 0.55 : 0,
          shadowRadius: position === 1 ? 10 : 0,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <View
          className="overflow-hidden rounded-full bg-[#091425]"
          style={{ width: style.size - 8, height: style.size - 8 }}
        >
          <AvatarImage nickname={member?.nickname ?? ''} path={member?.avatar_url} />
        </View>
      </View>

      <CText className="mt-2 max-w-[88px] text-center text-xs font-bold text-white" numberOfLines={1}>
        {member?.nickname ?? '—'}
      </CText>
      <CText className={`text-xs font-bold ${style.pointsColor}`}>
        {member?.total_points != null ? `${member.total_points} ${t('pts')}` : '—'}
      </CText>
    </View>
  );

  if (!member?.member_id) {
    return (
      <TouchableOpacity disabled activeOpacity={1}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <Link href={`/(app)/(member)/member/id?memberId=${member.member_id}`} asChild>
      <TouchableOpacity activeOpacity={0.7}>{content}</TouchableOpacity>
    </Link>
  );
}

export default function TopThree({ topMembers }: TopThreeProps) {
  const { t } = useTranslation();

  if (!topMembers || topMembers.length === 0) return null;

  return (
    <View className="mx-3 mb-3">
      <LinearGradient
        colors={['#0B1B33', '#081325']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-2xl border border-[#223554]"
      >
        <ExpoImage
          source={stadiumBg}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.25 }}
        />
        <LinearGradient
          colors={['rgba(6,12,24,0.35)', 'rgba(6,12,24,0.65)', 'rgba(6,12,24,0.85)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as StyleProp<ViewStyle>}
        />

        <View className="px-4 pb-5 pt-4">
          <View className="mb-4 flex-row items-center gap-1.5">
            <Star size={14} color={GOLD} fill={GOLD} />
            <CText className="text-sm font-bold text-white">{t('Top 3')}</CText>
          </View>

          <View className="flex-row items-end justify-center gap-3">
            <View className="flex-1 items-center">
              <PodiumPlayer member={topMembers[1]} position={2} />
            </View>
            <View className="flex-1 items-center">
              <PodiumPlayer member={topMembers[0]} position={1} />
            </View>
            <View className="flex-1 items-center">
              <PodiumPlayer member={topMembers[2]} position={3} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
