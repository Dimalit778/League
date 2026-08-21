import { Text } from '@/components';
import { PredictionWithMemberType } from '@/features/matches/types';

import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Minus, Plus } from 'lucide-react-native';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, View } from 'react-native';

const MIN_SCORE = 0;
const MAX_SCORE = 9;
const STEPPER_WIDTH = 148;
const ICON_COLOR = '#D7DCE7';

const clampScore = (value: number) => Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));

export type PredictionDraftState = {
  hasChanges: boolean;
  isPending: boolean;
};

export type PredictionFormHandle = {
  save: () => Promise<void>;
};

type PredictionFormProps = {
  prediction?: PredictionWithMemberType;
  matchId: number;
  onSaveSuccess?: () => void;
  onDraftChange?: (state: PredictionDraftState) => void;
};

type ScoreStepperProps = {
  value: number;
  decreaseAccessibilityLabel: string;
  increaseAccessibilityLabel: string;
  disabled: boolean;
  onChange: (value: number) => void;
};

function ScoreStepper({
  value,
  decreaseAccessibilityLabel,
  increaseAccessibilityLabel,
  disabled,
  onChange,
}: ScoreStepperProps) {
  const canDecrease = !disabled && value > MIN_SCORE;
  const canIncrease = !disabled && value < MAX_SCORE;

  return (
    <View
      className=" flex-row items-stretch overflow-hidden rounded-lg border border-white/25 bg-gray-900"
      style={{ direction: 'ltr', width: STEPPER_WIDTH, height: 44 }}
    >
      <Pressable
        className="flex-1 items-center justify-center border-r border-white/20 active:bg-white/10"
        onPress={() => onChange(value - 1)}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel={decreaseAccessibilityLabel}
        accessibilityState={{ disabled: !canDecrease }}
        hitSlop={4}
      >
        <Minus size={22} color={ICON_COLOR} strokeWidth={2} opacity={canDecrease ? 0.9 : 0.4} />
      </Pressable>

      <View className="flex-1 items-center justify-center">
        <Text ltr variant="header" className="text-center text-white">
          {value}
        </Text>
      </View>

      <Pressable
        className="flex-1 items-center justify-center border-l border-white/20 active:bg-white/10"
        onPress={() => onChange(value + 1)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel={increaseAccessibilityLabel}
        accessibilityState={{ disabled: !canIncrease }}
        hitSlop={4}
      >
        <Plus size={22} color={ICON_COLOR} strokeWidth={2} opacity={canIncrease ? 0.9 : 0.4} />
      </Pressable>
    </View>
  );
}

const PredictionForm = forwardRef<PredictionFormHandle, PredictionFormProps>(function PredictionForm(
  { prediction, matchId, onSaveSuccess, onDraftChange },
  ref,
) {
  const { t } = useTranslation();
  const memberId = useMemberId();
  const [homeScore, setHomeScore] = useState(clampScore(prediction?.home_score ?? 0));
  const [awayScore, setAwayScore] = useState(clampScore(prediction?.away_score ?? 0));
  const [hasInteracted, setHasInteracted] = useState(false);
  const [savedScores, setSavedScores] = useState<{ home: number; away: number } | null>(
    prediction ? { home: clampScore(prediction.home_score), away: clampScore(prediction.away_score) } : null,
  );

  const upsertPrediction = useUpsertPrediction();

  const hasChanges = savedScores ? homeScore !== savedScores.home || awayScore !== savedScores.away : hasInteracted;

  useEffect(() => {
    onDraftChange?.({ hasChanges, isPending: upsertPrediction.isPending });
  }, [hasChanges, onDraftChange, upsertPrediction.isPending]);

  const handleSave = useCallback(async () => {
    if (!matchId || !memberId || !hasChanges || upsertPrediction.isPending) {
      return;
    }

    try {
      await upsertPrediction.mutateAsync({
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        league_member_id: memberId,
      });
      setSavedScores({ home: homeScore, away: awayScore });
      setHasInteracted(false);
      onSaveSuccess?.();
    } catch {
      // Alert handled in useUpsertPrediction
    }
  }, [awayScore, hasChanges, homeScore, matchId, memberId, onSaveSuccess, upsertPrediction]);

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

  const updateHomeScore = (value: number) => {
    setHomeScore(clampScore(value));
    setHasInteracted(true);
  };

  const updateAwayScore = (value: number) => {
    setAwayScore(clampScore(value));
    setHasInteracted(true);
  };

  return (
    <View className="w-full flex-row items-center justify-between ">
      <ScoreStepper
        value={homeScore}
        onChange={updateHomeScore}
        decreaseAccessibilityLabel={t('Decrease home score')}
        increaseAccessibilityLabel={t('Increase home score')}
        disabled={upsertPrediction.isPending}
      />
      <ScoreStepper
        value={awayScore}
        onChange={updateAwayScore}
        decreaseAccessibilityLabel={t('Decrease away score')}
        increaseAccessibilityLabel={t('Increase away score')}
        disabled={upsertPrediction.isPending}
      />
    </View>
  );
});

export default PredictionForm;
