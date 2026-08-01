import { Card, Text } from '@/components/ui';
import { MemberStats as MemberStatsType } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';
type PredictionChartProps = MemberStatsType | { stats: MemberStatsType };

export default function PredictionChart(props: PredictionChartProps) {
  const stats = 'stats' in props ? props.stats : props;
  const { t } = useTranslation();
  const bingoPercentage = stats.totalPredictions > 0 ? (stats.bingoHits / stats.totalPredictions) * 100 : 0;

  const regularPercentage = stats.totalPredictions > 0 ? (stats.regularHits / stats.totalPredictions) * 100 : 0;

  const missedPercentage = stats.totalPredictions > 0 ? (stats.missedHits / stats.totalPredictions) * 100 : 0;

  return (
    <Card className="mb-4">
      <Text className="text-base font-bold mb-2">
        {t('Prediction Results')}
      </Text>

      <View className="h-6 flex-row rounded-md overflow-hidden mb-2">
        {stats.totalPredictions > 0 ? (
          <>
            <View style={{ width: `${bingoPercentage}%` }} className="bg-success border-1 border-black" />
            <View style={{ width: `${regularPercentage}%` }} className="bg-muted " />
            <View style={{ width: `${missedPercentage}%` }} className="bg-error " />
          </>
        ) : (
          <View className="flex-1 bg-subtle" />
        )}
      </View>

      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-success mr-2" />
          <Text>
            {t('Bingo')} ({stats.bingoHits})
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-muted mr-2" />
          <Text>
            {t('Regular')} ({stats.regularHits})
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-error mr-2" />
          <Text>
            {t('Missed')} ({stats.missedHits})
          </Text>
        </View>
      </View>
    </Card>
  );
}
