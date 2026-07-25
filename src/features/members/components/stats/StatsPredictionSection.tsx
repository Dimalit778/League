import { Card, Text } from '@/components/ui';
import { MemberStats } from '@/features/members/types/stats.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, Crosshair, Flame, X } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const GAUGE_SIZE = 64;
const STROKE_WIDTH = 3;
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
    <Card className="p-1.5" contentClassName=" gap-3">
      <Text small semibold className="text-muted text-center">
        {t('Accuracy')}
      </Text>

      <View className="items-center justify-center py-1">
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
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}
          >
            <Text semibold>{Math.round(clamped)}%</Text>
          </View>
        </View>
      </View>

      <Text small semibold className="text-primary text-center" numberOfLines={2}>
        {t(messageKey)}
      </Text>
    </Card>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="flex-1 p-1.5" contentClassName="items-center justify-center">
      <View className="mb-1.5">{icon}</View>
      <Text small className="text-muted" numberOfLines={1}>
        {label}
      </Text>
      <Text small semibold>
        {value}
      </Text>
    </Card>
  );
}

export function StatsPredictionSection({ stats }: { stats: MemberStats }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { bingoHits, missedHits, regularHits, currentStreak, accuracy } = stats;

  return (
    <View className="flex-1 gap-2">
      <Text semibold>{t('Stats')}</Text>

      <View className="flex-row gap-2 ">
        <AccuracyGauge accuracy={accuracy} />

        <View className="flex-1 gap-2">
          <View className="flex-1 flex-row gap-2">
            <MetricTile
              icon={<Crosshair size={18} color={colors.primary} />}
              label={t('Current streak')}
              value={currentStreak}
            />
          </View>
          <View className="flex-1 flex-row gap-2">
            <MetricTile icon={<Flame size={18} color={colors.primary} />} label={t('Bingo')} value={bingoHits} />
            <MetricTile icon={<X size={18} color={colors.error} />} label={t('Missed')} value={missedHits} />
            <MetricTile icon={<Check size={18} color={colors.primary} />} label={t('Hits')} value={regularHits} />
          </View>
        </View>
      </View>
    </View>
  );
}
