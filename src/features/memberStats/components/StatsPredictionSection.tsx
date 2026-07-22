import { Text } from '@/components/ui';
import { MemberStats } from '@/features/memberStats/types';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, Crosshair, X } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const GOLD = '#E3B421';
const TRACK_COLOR = '#223554';
const GAUGE_SIZE = 80;
const STROKE_WIDTH = 9;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function getAccuracyMessage(accuracy: number): 'great' | 'good' | 'improve' {
  if (accuracy >= 70) return 'great';
  if (accuracy >= 50) return 'good';
  return 'improve';
}

function AccuracyGauge({ accuracy }: { accuracy: number }) {
  const { t } = useTranslation();
  const clamped = Math.min(100, Math.max(0, accuracy));
  const strokeDashoffset = CIRCUMFERENCE * (1 - clamped / 100);
  const messageKey =
    getAccuracyMessage(clamped) === 'great'
      ? "You're performing great!"
      : getAccuracyMessage(clamped) === 'good'
        ? 'Keep it up!'
        : 'Room to improve';

  return (
    <View className="flex-1 overflow-hidden rounded-2xl border border-border bg-surfaceSecondary p-3">
      <Text className="text-xs font-semibold text-[#97A7BF]">{t('Accuracy')}</Text>

      <View className="mt-2 items-center justify-center">
        <View style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
          <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
            <Circle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={RADIUS}
              stroke={TRACK_COLOR}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={RADIUS}
              stroke={GOLD}
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
            <Text small className="text-muted uppercase tracking-wide">
              {t('Accuracy')}
            </Text>
          </View>
        </View>
      </View>

      <Text small semibold className="text-primary mt-1 text-center">
        {t(messageKey)}
      </Text>
    </View>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <View className="flex-1 overflow-hidden rounded-xl border border-border  p-2.5">
      <View className="mb-1.5 h-7 w-7 items-center justify-center rounded-lg border border-border ">{icon}</View>
      <Text small className="text-muted" numberOfLines={1}>
        {label}
      </Text>
      <Text small semibold>
        {value}
      </Text>
    </View>
  );
}

export function StatsPredictionSection({ stats }: { stats?: MemberStats }) {
  const { t } = useTranslation();
  const accuracy = stats?.accuracy ?? 0;
  const bingoHits = stats?.bingoHits ?? 0;
  const missedHits = stats?.missedHits ?? 0;
  const regularHits = stats?.regularHits ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;

  return (
    <View className="flex-row gap-2 ">
      <AccuracyGauge accuracy={accuracy} />

      <View className="flex-1 gap-2">
        <View className="flex-1 flex-row gap-2">
          <MetricTile icon={<Crosshair size={14} color={GOLD} />} label={t('Current streak')} value={currentStreak} />
        </View>
        <View className="flex-1 flex-row gap-2">
          <MetricTile icon={<Check size={14} color={GOLD} />} label={t('Bingo hits')} value={bingoHits} />
          <MetricTile icon={<X size={14} color={GOLD} />} label={t('Missed')} value={missedHits} />
          <MetricTile icon={<Check size={14} color={GOLD} />} label={t('Regular hits')} value={regularHits} />
        </View>
      </View>
    </View>
  );
}
