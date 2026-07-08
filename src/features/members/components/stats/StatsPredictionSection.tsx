import { Text } from '@/components/ui';
import { MemberStatsType } from '@/features/members/types';

import { useTranslation } from '@/hooks/useTranslation';
import { Crosshair, FileText, Flame, Trophy } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const GOLD = '#E3B421';
const TRACK_COLOR = '#223554';
const GAUGE_SIZE = 110;
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
    <View className="flex-1 overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] p-3">
      <Text className="text-xs font-semibold text-[#97A7BF]">{t('Prediction accuracy')}</Text>

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
              rotation="-90"
              origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}
            />
          </Svg>
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}
          >
            <Text className="text-2xl font-black text-white">{Math.round(clamped)}%</Text>
            <Text className="text-[10px] uppercase tracking-wide text-[#97A7BF]">{t('Accuracy')}</Text>
          </View>
        </View>
      </View>

      <Text className="mt-1 text-center text-xs font-semibold text-[#D5B13F]">{t(messageKey)}</Text>
    </View>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <View className="flex-1 overflow-hidden rounded-xl border border-[#223554] bg-[#101A2A] p-2.5">
      <View className="mb-1.5 h-7 w-7 items-center justify-center rounded-lg border border-[#D5B13F]/30 bg-[#1A2740]">
        {icon}
      </View>
      <Text className="text-[10px] text-[#97A7BF]" numberOfLines={1}>
        {label}
      </Text>
      <Text className="mt-0.5 text-lg font-bold text-white">{value}</Text>
    </View>
  );
}

type StatsPredictionSectionProps = {
  stats: MemberStatsType;
};

export function StatsPredictionSection({ stats }: StatsPredictionSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="mx-3 mt-4 flex-row gap-2">
      <AccuracyGauge accuracy={stats.accuracy} />

      <View className="flex-1 gap-2">
        <View className="flex-1 flex-row gap-2">
          <MetricTile icon={<Crosshair size={14} color={GOLD} />} label={t('Correct scores')} value={stats.bingoHits} />
          <MetricTile
            icon={<FileText size={14} color={GOLD} />}
            label={t('Predictions made')}
            value={stats.totalPredictions}
          />
        </View>
        <View className="flex-1 flex-row gap-2">
          <MetricTile
            icon={<Flame size={14} color={GOLD} />}
            label={t('Current streak')}
            value={stats.currentStreak ?? 0}
          />
          <MetricTile
            icon={<Trophy size={14} color={GOLD} />}
            label={t('Longest streak')}
            value={stats.longestStreak ?? 0}
          />
        </View>
      </View>
    </View>
  );
}
