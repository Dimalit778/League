import { Divider, Row, Text } from '@/components';
import { FlatPremiumCard } from '@/components/ui/Cards';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { Award, Crown, Users } from 'lucide-react-native';
import { View } from 'react-native';
import { LeagueOverviewSummary } from '../../types';

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className={cn('flex-1 items-center', spacing.inline)}>
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

export default function LeagueSummary({ leagueSummary }: { leagueSummary: LeagueOverviewSummary }) {
  const { rank, points, membersCount } = leagueSummary;
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <FlatPremiumCard>
      <Row>
        <Stat
          icon={<Crown size={20} color={colors.muted} strokeWidth={1.5} />}
          label={t('Rank')}
          value={rank > 0 ? `#${rank}` : '—'}
        />
        <Divider orientation="vertical" className="h-12 bg-muted" />
        <Stat
          icon={<Award size={20} color={colors.muted} strokeWidth={1.5} />}
          label={t('Points')}
          value={String(points)}
        />
        <Divider orientation="vertical" className="h-12 bg-muted" />
        <Stat
          icon={<Users size={20} color={colors.muted} strokeWidth={1.5} />}
          label={t('Members')}
          value={String(membersCount)}
        />
      </Row>
    </FlatPremiumCard>
  );
}
