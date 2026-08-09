import { Button, DirectionalIcon, Divider, GlassCard, LogoBadge, Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Award, Crown, Star, Users } from 'lucide-react-native';
import { View } from 'react-native';
import { LeagueSummary } from '../../types';

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      {icon}
      <Text variant="subtitle" tone="primary" numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function PrimaryLeagueCard({ league, onPress }: { league: LeagueSummary; onPress?: () => void }) {
  const { colors, effects } = useThemeTokens();
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) return onPress();
    router.replace('/(app)/(league)/(tabs)');
  };

  return (
    <GlassCard variant="primary" onPress={handlePress} padding="md" contentClassName="gap-4">
      <View className="flex-row justify-between ">
        <Row className="items-center gap-3">
          <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={48} height={48} />
          <View className="min-w-0 gap-0.5">
            <Text variant="titleLarge" numberOfLines={1}>
              {league.league_name}
            </Text>
            <Text tone="muted" numberOfLines={1}>
              {league.nickname}
            </Text>
          </View>
        </Row>
        <Row
          className="self-center items-center gap-1.5 rounded-full border px-2.5 py-1"
          style={{
            borderColor: colors.primary,
            backgroundColor: effects.cardActiveGlow,
          }}
        >
          <Star size={16} color={colors.primary} strokeWidth={1.5} />
          <Text variant="bodySmall" tone="primary" className="font-semibold" numberOfLines={1}>
            {t('Primary League')}
          </Text>
        </Row>
      </View>

      <GlassCard padding="sm" contentClassName="gap-4 flex-row ">
        <Stat
          icon={<Users size={16} color={colors.muted} strokeWidth={1.5} />}
          label={t('Members')}
          value={`${league.members_count ?? 0}`}
        />
        <Divider orientation="vertical" className="h-12 bg-border" />
        <Stat
          icon={<Award size={16} color={colors.muted} strokeWidth={1.5} />}
          label={t('Points')}
          value={`${league.total_points ?? 0}`}
        />
        <Divider orientation="vertical" className="h-12 bg-border" />
        <Stat
          icon={<Crown size={16} color={colors.muted} strokeWidth={1.5} />}
          label={t('Rank')}
          value={league.rank ? `#${league.rank}` : '—'}
        />
      </GlassCard>

      <Button
        variant="glass"
        fullWidth
        label={t('Enter league')}
        onPress={handlePress}
        rightIcon={<DirectionalIcon size={18} color={colors.text} />}
        accessibilityLabel={`${league.league_name}, ${league.nickname}`}
      />
    </GlassCard>
  );
}
