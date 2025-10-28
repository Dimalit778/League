import { PredictionLeaderboardType } from '@/types';

import { predictionAccuracy } from '@/utils/match-utils';
import { memo } from 'react';
import { Text, View } from 'react-native';

type PredictionStatusProps = {
  prediction: PredictionLeaderboardType | null;
  match: {
    score: {
      fullTime?: { home: number | null; away: number | null };
    } | null;
    status: string;
  };
};

const PredictionStatus = memo(
  ({ prediction, match }: PredictionStatusProps) => {
    if (!prediction) {
      return null;
    }

    let accuracy = null;
    const isMatchFinished = match.status === 'FINISHED';
    const hasScores =
      match.score?.fullTime?.home !== null &&
      match.score?.fullTime?.away !== null;

    if (isMatchFinished && hasScores && match.score?.fullTime) {
      accuracy = predictionAccuracy(
        prediction.home_score,
        prediction.away_score,
        match.score.fullTime.home,
        match.score.fullTime.away
      );
    }

    return (
      <View className="flex-row justify-between px-2 bg-gray-700 ">
        <View className="w-1/3 ">
          <Text
            className="text-sm font-bold"
            style={{ color: accuracy?.color }}
          >
            {accuracy?.text}
          </Text>
        </View>
        <View className="w-1/3 items-center">
          <View
            className="items-center px-4"
            style={{ backgroundColor: accuracy?.bg, borderWidth: 1 }}
          >
            <Text className="text-background text-sm font-semibold">
              {prediction?.home_score ?? 0} - {prediction?.away_score ?? 0}
            </Text>
          </View>
        </View>
        <View className="w-1/3 items-end">
          <Text
            className="text-sm font-bold"
            style={{ color: accuracy?.color }}
          >
            + {accuracy?.points ?? 0} pts
          </Text>
        </View>
      </View>
    );
  }
);

PredictionStatus.displayName = 'PredictionStatus';

export default PredictionStatus;
