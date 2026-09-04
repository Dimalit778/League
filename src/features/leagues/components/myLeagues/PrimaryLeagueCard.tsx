import { Button, Card, Divider, MyImage, Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Award, Crown, Star, Users } from 'lucide-react-native';
import { View } from 'react-native';
import { LeagueSummary } from '../../types';

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      {icon}
      <Text weight="semibold" size="lg" tone="primary">
        {value}
      </Text>
    </View>
  );
}

export default function PrimaryLeagueCard({ league, onPress }: { league: LeagueSummary; onPress?: () => void }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) return onPress();
    router.replace('/(app)/(league)/(tabs)');
  };

  return (
    <Card padding="md" variant="surface" contentClassName="gap-3">
      <Row className="w-full min-w-0  gap-2">
        <Row className="min-w-0 flex-1 items-center gap-3">
          <MyImage source={league.competition_flag ?? ''} width={48} height={48} />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="heading" size="2xl" numberOfLines={2}>
              {league.league_name}
            </Text>
            <Text tone="muted" numberOfLines={1}>
              {league.nickname}
            </Text>
          </View>
        </Row>
        <View className="shrink-0 mb-3">
          <Star size={38} color={colors.primary} fill={colors.primary} />
        </View>
      </Row>

      <Card padding="sm" variant="soft" contentClassName="flex-row ">
        <Stat
          icon={<Users size={16} color={colors.muted} strokeWidth={1.5} />}
          value={`${league.members_count ?? 0}`}
        />
        <Divider orientation="vertical" className="h-12 bg-border" />
        <Stat icon={<Award size={16} color={colors.muted} strokeWidth={1.5} />} value={`${league.total_points ?? 0}`} />
        <Divider orientation="vertical" className="h-12 bg-border" />
        <Stat
          icon={<Crown size={16} color={colors.muted} strokeWidth={1.5} />}
          value={league.rank ? `#${league.rank}` : '—'}
        />
      </Card>

      <Button
        intent="outline"
        fullWidth
        label={t('Enter league')}
        onPress={handlePress}
        arrowIcon={true}
        accessibilityLabel={`${league.league_name}, ${league.nickname}`}
      />
    </Card>
  );
}
