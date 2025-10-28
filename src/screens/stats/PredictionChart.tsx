import { Card } from '@/components/ui';
import { MemberStatsType } from '@/types';
import { Text, View } from 'react-native';

const PredictionChart = (stats: MemberStatsType) => {
  // Calculate percentages for the chart
  const bingoPercentage =
    stats.totalPredictions > 0
      ? (stats.bingoHits / stats.totalPredictions) * 100
      : 0;

  const regularPercentage =
    stats.totalPredictions > 0
      ? (stats.regularHits / stats.totalPredictions) * 100
      : 0;

  const missedPercentage =
    stats.totalPredictions > 0
      ? (stats.missedHits / stats.totalPredictions) * 100
      : 0;

  return (
    <Card className="p-4 mb-4">
      <Text className="text-text text-lg font-bold mb-4">
        Prediction Results
      </Text>

      <View className="h-6 flex-row rounded-md overflow-hidden mb-4">
        {stats.totalPredictions > 0 ? (
          <>
            <View
              style={{ width: `${bingoPercentage}%` }}
              className="bg-green-500"
            />
            <View
              style={{ width: `${regularPercentage}%` }}
              className="bg-yellow-500"
            />
            <View
              style={{ width: `${missedPercentage}%` }}
              className="bg-red-500"
            />
          </>
        ) : (
          <View className="flex-1 bg-gray-300" />
        )}
      </View>

      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <Text className="text-text">Bingo ({stats.bingoHits})</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
          <Text className="text-text">Regular ({stats.regularHits})</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <Text className="text-text">Missed ({stats.missedHits})</Text>
        </View>
      </View>
    </Card>
  );
};

export default PredictionChart;
