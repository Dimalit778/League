import { Card, Row, Text } from '@/components';
import { type MemberStats } from '@/features/members/types/stats.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { Check, Crosshair, Flame, X } from 'lucide-react-native';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
const GAUGE_SIZE = 72;
const STROKE_WIDTH = 4;

export function getAccuracyMessage(accuracy: number): 'great' | 'good' | 'improve' {
  if (accuracy >= 70) return 'great';
  if (accuracy >= 50) return 'good';
  return 'improve';
}

function AccuracyGauge({ accuracy }: { accuracy: number }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { fontScale } = useWindowDimensions();
  const gaugeSize = GAUGE_SIZE * Math.max(1, Math.min(fontScale, 2));
  const radius = (gaugeSize - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, accuracy));
  const strokeDashoffset = circumference * (1 - clamped / 100);
  const messageKey =
    getAccuracyMessage(clamped) === 'great'
      ? "You're performing great!"
      : getAccuracyMessage(clamped) === 'good'
        ? 'Keep it up!'
        : 'Room to improve';

  return (
    <Card
      variant="soft"
      padding="lg"
      className="self-stretch"
      contentClassName={cn('flex-1 items-center justify-center gap-2', spacing.row)}
    >
      <Text variant="label">{t('Accuracy')}</Text>
      <View style={{ width: gaugeSize, height: gaugeSize }}>
        <Svg width={gaugeSize} height={gaugeSize}>
          <Circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text variant="title" size="lg" className="text-center">
            {Math.round(clamped)}%
          </Text>
        </View>
      </View>
      <Text variant="caption" tone="muted" className="text-center" numberOfLines={2}>
        {t(messageKey)}
      </Text>
    </Card>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card variant="soft" padding="sm" className="min-w-0 flex-1" contentClassName="items-center justify-center gap-1">
      {icon}
      <Text variant="title" size="lg" className="text-center">
        {String(value)}
      </Text>
      <Text variant="caption" tone="muted" numberOfLines={2} className="text-center">
        {label}
      </Text>
    </Card>
  );
}

export function StatsPredictionSection({ stats }: { stats: MemberStats }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { bingoHits, missedHits, regularHits, currentStreak, accuracy } = stats;

  return (
    <Row className="w-full items-stretch gap-2">
      <AccuracyGauge accuracy={accuracy} />
      <View className={cn('min-w-0 flex-1', spacing.row)}>
        <MetricTile
          icon={<Flame size={20} color={colors.success} strokeWidth={2} />}
          label={t('Current streak')}
          value={currentStreak}
        />
        <View className={cn('min-h-0 flex-1 flex-row', spacing.row)}>
          <MetricTile
            icon={<Crosshair size={18} color={colors.primary} strokeWidth={2} />}
            label={t('Bingo')}
            value={bingoHits}
          />
          <MetricTile
            icon={<Check size={18} color={colors.success} strokeWidth={2} />}
            label={t('Hits')}
            value={regularHits}
          />
          <MetricTile
            icon={<X size={18} color={colors.error} strokeWidth={2} />}
            label={t('Missed')}
            value={missedHits}
          />
        </View>
      </View>
    </Row>
  );
}
