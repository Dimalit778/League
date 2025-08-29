import { Tables } from '@/types/database.types';
import { predictionAccuracy } from '@/utils/match-utils';
import { Text, View } from 'react-native';

type PredictionStatusProps = {
  prediction: Tables<'predictions'> | null;
  match: {
    home_score: number;
    away_score: number;
    status: string;
  };
};

const PredictionStatus = ({ prediction, match }: PredictionStatusProps) => {
  if (!prediction) {
    return null;
  }

  let accuracy = null;
  if (prediction?.is_processed) {
    accuracy = predictionAccuracy(
      prediction.home_score,
      prediction.away_score,
      match.home_score,
      match.away_score
    );
  }

  return (
    <View className="flex-row mb-1 border-b border-border py-1">
      <View className="flex-1 items-start">
        {accuracy && (
          <Text className="text-sm" style={{ color: accuracy.color }}>
            {accuracy.text}
          </Text>
        )}
      </View>
      <View
        className="flex-row min-w-[50px] justify-center rounded-md"
        style={{
          borderColor: accuracy?.color ?? '#ababab',
          borderWidth: 1,
        }}
      >
        <Text className="text-muted text-sm">
          {prediction?.home_score ?? 0} - {prediction?.away_score ?? 0}
        </Text>
      </View>
      <View className="flex-1 items-end">
        {accuracy && (
          <Text className="text-sm font-bold" style={{ color: accuracy.color }}>
            + {accuracy.points} pts
          </Text>
        )}
      </View>
    </View>
  );
};

export default PredictionStatus;
