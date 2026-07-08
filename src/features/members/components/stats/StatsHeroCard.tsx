import { AvatarImage, Text } from '@/components/ui';
import { MemberStatsType } from '@/features/members/types';
import { useTranslation } from '@/hooks/useTranslation';
import { formatNameCapitalize } from '@/utils/formats';
import stadiumBg from '@assets/images/fieldImage.jpg';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, Star } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOLD = '#E3B421';

type StatsHeroCardProps = {
  nickname: string;
  avatarUrl: string | null;
  isPrimary: boolean;
  stats?: MemberStatsType;
};

export function StatsHeroCard({ nickname, avatarUrl, isPrimary, stats }: StatsHeroCardProps) {
  const { t } = useTranslation();
  const displayName = formatNameCapitalize(nickname);
  const rank = stats?.position ? `#${stats.position}` : '—';
  const points = stats?.totalPoints != null ? `${stats.totalPoints} ${t('pts')}` : '—';
  const insets = useSafeAreaInsets();

  return (
    <View className="mx-3 mt-1">
      <LinearGradient
        colors={['#0B1B33', '#081325']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-3xl border border-[#223554]"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <ExpoImage
          source={stadiumBg}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.22 }}
        />
        <LinearGradient
          colors={['rgba(6,12,24,0.3)', 'rgba(6,12,24,0.55)', 'rgba(6,12,24,0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />

        <View className="p-4" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center gap-4">
            <View
              className="h-20 w-20 items-center justify-center rounded-full border-2 border-[#D5B13F]"
              style={{
                shadowColor: GOLD,
                shadowOpacity: 0.4,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <View className="h-[72px] w-[72px] overflow-hidden rounded-full bg-[#091425]">
                <AvatarImage
                  nickname={nickname}
                  path={avatarUrl}
                  className="h-[72px] w-[72px] rounded-full border-0 bg-[#091425]"
                />
              </View>
            </View>

            <View className="min-w-0 flex-1">
              <Text className="text-xl font-black text-white" numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row rounded-2xl border border-[#223554] bg-[#091425]/60 px-4 py-3">
            <View className="flex-1 items-center">
              <BarChart3 size={16} color={GOLD} />
              <Text className="mt-1 text-[10px] uppercase tracking-wide text-[#97A7BF]">{t('Rank')}</Text>
              <Text className="mt-0.5 text-lg font-bold text-white">{rank}</Text>
            </View>
            <View className="mx-3 w-px self-stretch bg-[#223554]" />
            <View className="flex-1 items-center">
              <Star size={16} color={GOLD} fill={GOLD} />
              <Text className="mt-1 text-[10px] uppercase tracking-wide text-[#97A7BF]">{t('Total Points')}</Text>
              <Text className="mt-0.5 text-lg font-bold text-white">{points}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
