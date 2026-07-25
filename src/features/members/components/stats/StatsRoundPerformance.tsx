import { Text } from '@/components/ui';
import { RoundPerformance } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3 } from 'lucide-react-native';
import { View } from 'react-native';

const GOLD = '#E3B421';

type StatsRoundPerformanceProps = {
  rounds: RoundPerformance[];
};

export function StatsRoundPerformance({ rounds }: StatsRoundPerformanceProps) {
  const { t } = useTranslation();
  const maxPoints = Math.max(...rounds.map((r) => r.points), 1);

  if (rounds.length === 0) {
    return (
      <View className="mx-3 mt-5">
        <View className="mb-3 flex-row items-center gap-2">
          <BarChart3 size={16} color={GOLD} />
          <Text className="text-base font-bold text-white">{t('Performance by round')}</Text>
        </View>
        <View className="rounded-2xl border border-[#223554] bg-[#101A2A] p-4">
          <Text className="text-center text-sm text-[#97A7BF]">{t('No round data yet')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-3 mt-5">
      <View className="mb-3 flex-row items-center gap-2">
        <BarChart3 size={16} color={GOLD} />
        <Text className="text-base font-bold text-white">{t('Performance by round')}</Text>
      </View>

      <View className="rounded-2xl border border-[#223554] bg-[#101A2A] p-4">
        {rounds.map((round, index) => {
          const barWidth = `${Math.max(8, (round.points / maxPoints) * 100)}%`;
          return (
            <View key={round.round} className={index < rounds.length - 1 ? 'mb-3' : ''}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-[#97A7BF]">{t('Round {{n}}', { n: round.round })}</Text>
                <Text className="text-xs font-semibold text-white">
                  {round.points} {t('pts')}
                </Text>
              </View>
              <View className="h-2.5 overflow-hidden rounded-full bg-[#1A2740]">
                <View className="h-full rounded-full bg-[#E3B421]" style={{ width: barWidth as `${number}%` }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
