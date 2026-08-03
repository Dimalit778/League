import { Row } from '@/components/layout';
import { Card, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { Check, Crosshair, Flame, Hourglass, Target, Trophy, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { MemberStats as MemberStatsType } from '../types/stats.type';

type MetricProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
  tone?: 'default' | 'primary' | 'success' | 'error' | 'warning';
};

function Metric({ icon, label, value, tone = 'default' }: MetricProps) {
  return (
    <Card variant="soft" padding="sm" className="min-w-0 flex-1" contentClassName="items-center gap-1">
      {icon}
      <Text variant="title" tone={tone} className="text-center">
        {value}
      </Text>
      <Text variant="caption" tone="muted" numberOfLines={1} className="text-center">
        {label}
      </Text>
    </Card>
  );
}

export default function MemberStats({ stats }: { stats?: MemberStatsType }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  const accuracy = Math.min(100, Math.max(0, stats?.accuracy ?? 0));

  return (
    <View className={spacing.stack}>
      <Row>
        <Text variant="subtitle">{t('Prediction statistics')}</Text>
      </Row>

      <Card variant="elevated" contentClassName="gap-4">
        <Row className="items-center gap-4">
          <View className="h-24 w-24 items-center justify-center rounded-full border-[6px] border-primary bg-subtle">
            <Text variant="titleLarge" className="text-center">
              {Math.round(accuracy)}%
            </Text>
          </View>
          <View className="min-w-0 flex-1 gap-2">
            <Row className="items-center justify-between">
              <View className="items-center gap-2">
                <Target size={20} color={colors.primary} />
                <Text variant="label">{t('Accuracy')}</Text>
              </View>
              <View className="items-end">
                <Text variant="title" tone="primary">
                  {stats?.totalPredictions ?? 0}
                </Text>
                <Text variant="caption" tone="muted">
                  {t('Predictions')}
                </Text>
              </View>
            </Row>
            <View className="h-2 overflow-hidden rounded-full bg-border">
              <View className="h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} />
            </View>
            <Text variant="bodySmall" tone="muted">
              {t('{{count}} correct predictions', { count: (stats?.bingoHits ?? 0) + (stats?.regularHits ?? 0) })}
            </Text>
          </View>
        </Row>
      </Card>

      <Row className={spacing.row}>
        <Metric
          icon={<Crosshair size={20} color={colors.primary} />}
          label={t('Bingo')}
          value={stats?.bingoHits ?? 0}
          tone="primary"
        />
        <Metric
          icon={<Check size={20} color={colors.success} />}
          label={t('Hits')}
          value={stats?.regularHits ?? 0}
          tone="success"
        />
        <Metric
          icon={<X size={20} color={colors.error} />}
          label={t('Missed')}
          value={stats?.missedHits ?? 0}
          tone="error"
        />
      </Row>

      <Row className={spacing.row}>
        <Metric
          icon={<Flame size={20} color={colors.warning} />}
          label={t('Current streak')}
          value={stats?.currentStreak ?? 0}
          tone="warning"
        />
        <Metric
          icon={<Trophy size={20} color={colors.primary} />}
          label={t('Longest streak')}
          value={stats?.longestStreak ?? 0}
          tone="primary"
        />
        <Metric
          icon={<Hourglass size={20} color={colors.muted} />}
          label={t('Pending')}
          value={stats?.pendingPredictions ?? 0}
        />
      </Row>
    </View>
  );
}
