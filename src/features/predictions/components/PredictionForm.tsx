import { Button, CText } from '@/components/ui';
import { PredictionMemberType } from '@/features/matches/types';
import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberStore } from '@/store/MemberStore';
import { ArrowDownIcon, ArrowUpIcon } from '@assets/icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
type PredictionFormProps = {
  prediction?: PredictionMemberType;
  matchId: number;
};

type ScoreInputProps = {
  value: number | null;
  onIncrement: () => void;
  onDecrement: () => void;
};

const ScoreInput = ({ value, onIncrement, onDecrement }: ScoreInputProps) => {
  const { colors } = useThemeTokens();

  return (
    <View className="border border-text rounded-md ">
      <Pressable
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel="Increment score"
        className="items-center justify-center py-3"
      >
        <ArrowUpIcon size={30} color={colors.text} />
      </Pressable>

      <View className="w-20 h-16 border-t border-b border-muted bg-surface justify-center items-center">
        <CText variant="h2" className=" text-text text-center ">
          {value === null ? 0 : value.toString()}
        </CText>
      </View>

      <Pressable
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrement score"
        className="items-center justify-center py-3"
      >
        <ArrowDownIcon size={30} color={colors.text} />
      </Pressable>
    </View>
  );
};

export default function PredictionForm({ prediction, matchId }: PredictionFormProps) {
  const { t } = useTranslation();
  const memberId = useMemberStore((s) => s.memberId);
  const router = useRouter();
  const [homeScore, setHomeScore] = useState<number | 0>(0);
  const [awayScore, setAwayScore] = useState<number | 0>(0);
  const [newHomeScore, setNewHomeScore] = useState<number | null>(null);
  const [newAwayScore, setNewAwayScore] = useState<number | null>(null);

  const upsertPrediction = useUpsertPrediction();

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.home_score);
      setAwayScore(prediction.away_score);
      setNewHomeScore(prediction.home_score);
      setNewAwayScore(prediction.away_score);
    } else {
      setHomeScore(0);
      setAwayScore(0);
      setNewHomeScore(null);
      setNewAwayScore(null);
    }
  }, [prediction]);

  const handleSave = async () => {
    if (!matchId || !memberId) {
      return;
    }
    try {
      await upsertPrediction.mutateAsync({
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        league_member_id: memberId,
      });

      router.back();
    } catch (error) {
      }
  };

  const handleHomeIncrement = () => {
    const newValue = Math.min(homeScore + 1, 9) as number;
    setHomeScore(newValue);
  };

  const handleHomeDecrement = () => {
    if (homeScore === 0) {
      return;
    }
    setHomeScore(homeScore - 1);
  };

  const handleAwayIncrement = () => {
    const newValue = Math.min(awayScore + 1, 9) as number;
    setAwayScore(newValue);
  };

  const handleAwayDecrement = () => {
    if (awayScore === 0) {
      return;
    }
    setAwayScore(awayScore - 1);
  };

  const isSaveDisabled = prediction ? newHomeScore === homeScore && newAwayScore === awayScore : false;

  return (
    <View className="flex-1 px-5 py-2">
      <View className="py-3 border-b border-border ">
        <CText variant="h2" className="text-text text-center ">
          {prediction ? t('My Prediction') : t('Enter your prediction')}
        </CText>
      </View>
      <View className="flex-1 ">
        {/* Score Inputs */}
        <View className="flex-row justify-center items-center mt-12">
          <ScoreInput value={homeScore} onIncrement={handleHomeIncrement} onDecrement={handleHomeDecrement} />
          <Text className="text-4xl text-text mx-4">-</Text>
          <ScoreInput value={awayScore} onIncrement={handleAwayIncrement} onDecrement={handleAwayDecrement} />
        </View>

        {/* Action Buttons */}
        <View className="flex-1 justify-center px-4">
          <View className="w-full md:w-[250px] md:mx-auto">
            <Button
              title={prediction ? t('Save') : t('Save Prediction')}
              onPress={handleSave}
              loading={upsertPrediction.isPending}
              disabled={upsertPrediction.isPending || isSaveDisabled}
              variant="secondary"
              size="md"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
