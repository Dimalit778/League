import { images } from '@/assets/images';
import { Divider, HeaderBackground, LogoBadge, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Podium, Star, Users } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { LeagueSummary } from '../../types';

type StatBlockProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatBlock({ icon, label, value }: StatBlockProps) {
  return (
    <View className="flex-1 items-center gap-1">
      <View className="flex-row items-center justify-center gap-1.5">
        {icon}
        <Text numberOfLines={1} className="text-xs text-muted">
          {label}
        </Text>
      </View>
      <Text numberOfLines={1} className="font-semibold text-text">
        {value}
      </Text>
    </View>
  );
}

export default function PrimaryLeagueCard({ league, onPress }: { league: LeagueSummary; onPress?: () => void }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.replace('/(app)/(league)/(tabs)');
  };

  return (
    <HeaderBackground>
      <Pressable onPress={handlePress} className="flex-row items-center gap-4 px-4 py-4">
        <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-surface">
          <LinearGradient
            colors={['rgba(255,211,0,0.22)', 'rgba(255,211,0,0.04)']}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
            }}
          />
          <ExpoImage
            source={images.trophyGold}
            contentFit="contain"
            style={{
              width: 52,
              height: 52,
            }}
          />
        </View>

        <View className="min-w-0 flex-1 justify-center gap-3">
          <View className="flex-row items-center gap-3">
            <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={48} height={48} />

            <View className="min-w-0 flex-1 gap-0.5">
              <Text numberOfLines={1} className="text-xl font-semibold">
                {league.league_name}
              </Text>
              <Text numberOfLines={1} className="text-base text-muted">
                {league.nickname}
              </Text>
            </View>

            <View className="rounded-full border border-primary p-1">
              <ChevronRight size={22} color={colors.primary} />
            </View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <StatBlock icon={<Podium size={18} color={colors.primary} />} label={t('Rank')} value={`#${league.rank}`} />

            <Divider orientation="vertical" className="h-10" />

            <StatBlock
              icon={<Star size={18} color={colors.primary} fill={colors.primary} />}
              label={t('Points')}
              value={`${league.total_points} ${t('pts')}`}
            />

            <Divider orientation="vertical" className="h-10" />

            <StatBlock
              icon={<Users size={18} color={colors.primary} />}
              label={t('Members')}
              value={`${league.members_count}`}
            />
          </View>
        </View>
      </Pressable>
    </HeaderBackground>
  );
}
