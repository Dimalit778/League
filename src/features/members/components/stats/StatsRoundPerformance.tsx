import { Text } from '@/components/ui';
import { RoundPerformance } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { BarChart3 } from 'lucide-react-native';
import { View } from 'react-native';

const GOLD = '#E3B421';

type StatsRoundPerformanceProps = {
  rounds: RoundPerformance[];
};

export function StatsRoundPerformance({ rounds }: StatsRoundPerformanceProps) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const maxPoints = Math.max(...rounds.map((r) => r.points), 1);

  if (rounds.length === 0) {
    return (
      <View className="mx-3 mt-5">
        <View
          className="mb-3 flex-row items-center gap-2"
          style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <BarChart3 size={16} color={GOLD} />
          <Text className="text-base font-bold text-white">{t('Performance by round')}</Text>
        </View>
        <View className="rounded-2xl border border-border bg-surface p-4">
          <Text className="text-center text-sm text-muted">{t('No round data yet')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-3 mt-5">
      <View
        className="mb-3 flex-row items-center gap-2"
        style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
      >
        <BarChart3 size={16} color={GOLD} />
        <Text className="text-base font-bold text-white">{t('Performance by round')}</Text>
      </View>

      <View className="rounded-2xl border border-border bg-surface p-4">
        {rounds.map((round, index) => {
          const barWidth = `${Math.max(8, (round.points / maxPoints) * 100)}%`;
          return (
            <View key={round.round} className={index < rounds.length - 1 ? 'mb-3' : ''}>
              <View
                className="mb-1 flex-row items-center justify-between"
                style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                <Text className="text-xs text-muted">{t('Round {{n}}', { n: round.round })}</Text>
                <Text className="text-xs font-semibold text-white">
                  {round.points} {t('pts')}
                </Text>
              </View>
              <View className="h-2.5 overflow-hidden rounded-full bg-subtle">
                <View className="h-full rounded-full bg-primary" style={{ width: barWidth as `${number}%` }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
