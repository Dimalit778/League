import { Card, Text } from '@/components/ui';
import { type MemberStats } from '@/features/members/types/stats.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useIsRTL } from '@/providers/LanguageProvider';
import { Check, Crosshair, Flame, X } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const GAUGE_SIZE = 72;
const STROKE_WIDTH = 4;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function getAccuracyMessage(accuracy: number): 'great' | 'good' | 'improve' {
  if (accuracy >= 70) return 'great';
  if (accuracy >= 50) return 'good';
  return 'improve';
}

function AccuracyGauge({ accuracy }: { accuracy: number }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const clamped = Math.min(100, Math.max(0, accuracy));
  const strokeDashoffset = CIRCUMFERENCE * (1 - clamped / 100);
  const messageKey =
    getAccuracyMessage(clamped) === 'great'
      ? "You're performing great!"
      : getAccuracyMessage(clamped) === 'good'
        ? 'Keep it up!'
        : 'Room to improve';

  return (
    <Card padding="sm" className="w-32" contentClassName={cn('items-center', spacing.row)}>
      <Text variant="label" tone="secondary">
        {t('Accuracy')}
      </Text>
      <View style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke={colors.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke={colors.primary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text variant="subtitle" className="text-center">
            {Math.round(clamped)}%
          </Text>
        </View>
      </View>
      <Text variant="caption" tone="primary" className="text-center" numberOfLines={2}>
        {t(messageKey)}
      </Text>
    </Card>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card padding="sm" className="min-w-0 flex-1" contentClassName="flex-1 items-center justify-center gap-1">
      {icon}
      <Text variant="caption" tone="muted" numberOfLines={1} className="text-center">
        {label}
      </Text>
      <Text variant="subtitle" className="text-center">
        {String(value)}
      </Text>
    </Card>
  );
}

export function StatsPredictionSection({ stats }: { stats: MemberStats }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const { bingoHits, missedHits, regularHits, currentStreak, accuracy } = stats;

  return (
    <View
      className={cn('flex-row', spacing.list)}
      style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
    >
      <AccuracyGauge accuracy={accuracy} />
      <View className={cn('min-w-0 flex-1', spacing.list)}>
        <MetricTile
          icon={<Flame size={20} color={colors.warning} strokeWidth={2} />}
          label={t('Current streak')}
          value={currentStreak}
        />
        <View className={cn('flex-1 flex-row', spacing.row)}>
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
    </View>
  );
}
