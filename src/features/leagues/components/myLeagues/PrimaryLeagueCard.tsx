import { DirectionalIcon, Divider, HeaderBackground, LogoBadge, MyImage, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Podium, Star, Users } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { images } from '@/assets/images';
import { Row } from '@/components/layout';
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
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${league.league_name}, ${league.nickname}`}
        className="min-h-11 flex-row items-center gap-4 px-4 py-4"
      >
        <View className="min-w-0 flex-1 justify-center gap-3">
          <Row className="items-center gap-3">
            <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={48} height={48} />

            <View className="min-w-0 flex-1 gap-0.5">
              <Text numberOfLines={1} className="text-xl font-semibold">
                {league.league_name}
              </Text>
              <Text numberOfLines={1} className="text-base text-muted">
                {league.nickname}
              </Text>
            </View>
          </Row>

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
        <View className="items-center justify-center">
          <View className="rounded-full border border-primary p-1">
            <DirectionalIcon size={23} color={colors.primary} />
          </View>
          <MyImage source={images.trophyGold} width={70} height={70} contentFit="contain" />
        </View>
      </Pressable>
    </HeaderBackground>
  );
}
