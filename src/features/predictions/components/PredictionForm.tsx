import { Button, Text } from '@/components';
import type { MemberPrediction } from '@/features/matches/types';

import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Minus, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

const MIN_SCORE = 0;
const MAX_SCORE = 9;
const STEPPER_WIDTH = 140;
const STEPPER_HEIGHT = 52;
const ICON_COLOR = '#D7DCE7';
const SAVED_FLASH_MS = 1200;

const clampScore = (value: number) => Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));

type PredictionFormProps = {
  prediction?: MemberPrediction;
  matchId: number;
  onSaveSuccess?: () => void;
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
      style={{ direction: 'ltr', width: STEPPER_WIDTH, height: STEPPER_HEIGHT }}
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
        <Text className="text-2xl font-bold text-center text-white">{value}</Text>
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

export default function PredictionForm({ prediction, matchId, onSaveSuccess }: PredictionFormProps) {
  const { t } = useTranslation();
  const memberId = useMemberId();
  const [homeScore, setHomeScore] = useState(() => clampScore(prediction?.home_score ?? 0));
  const [awayScore, setAwayScore] = useState(() => clampScore(prediction?.away_score ?? 0));
  const [savedScores, setSavedScores] = useState({
    home: clampScore(prediction?.home_score ?? 0),
    away: clampScore(prediction?.away_score ?? 0),
  });
  const [justSaved, setJustSaved] = useState(false);
  const predictionExists = Boolean(prediction);
  const [hasSavedPrediction, setHasSavedPrediction] = useState(predictionExists);

  const upsertPrediction = useUpsertPrediction();
  const isPending = upsertPrediction.isPending;

  const hasScoreChanges = homeScore !== savedScores.home || awayScore !== savedScores.away;
  const hasChanges = !hasSavedPrediction || hasScoreChanges;
  const canSave = hasChanges && !isPending;
  const saveLabel = isPending ? t('Saving') : justSaved ? t('Saved') : t('Save');

  const predictedHome = clampScore(prediction?.home_score ?? 0);
  const predictedAway = clampScore(prediction?.away_score ?? 0);

  useEffect(() => {
    // The saved prediction can arrive/change after mount (e.g. the match-detail
    // placeholder had no prediction yet, or a background refetch landed). Adopt
    // it into the form, but never clobber the user's unsaved edits.
    if (!hasScoreChanges) {
      setHomeScore(predictedHome);
      setAwayScore(predictedAway);
    }
    if (predictionExists) setHasSavedPrediction(true);
    setSavedScores({ home: predictedHome, away: predictedAway });
    // Adopt fetched scores without overwriting unsaved edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictedHome, predictedAway, predictionExists]);

  useEffect(() => {
    if (!justSaved) return;
    const timeoutId = setTimeout(() => setJustSaved(false), SAVED_FLASH_MS);
    return () => clearTimeout(timeoutId);
  }, [justSaved]);

  const handleSave = useCallback(async () => {
    if (!matchId || !memberId || !hasChanges || isPending) {
      return;
    }

    try {
      await upsertPrediction.mutateAsync({
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        league_member_id: memberId,
      });
      setHasSavedPrediction(true);
      setSavedScores({ home: homeScore, away: awayScore });
      setJustSaved(true);
      onSaveSuccess?.();
    } catch {
      // Alert handled in useUpsertPrediction
    }
  }, [awayScore, hasChanges, homeScore, isPending, matchId, memberId, onSaveSuccess, upsertPrediction]);

  const updateHomeScore = (value: number) => {
    setHomeScore(clampScore(value));
    setJustSaved(false);
  };

  const updateAwayScore = (value: number) => {
    setAwayScore(clampScore(value));
    setJustSaved(false);
  };

  return (
    <View className="gap-6">
      <View className="w-full flex-row items-center justify-between" style={{ direction: 'ltr' }}>
        <ScoreStepper
          value={homeScore}
          onChange={updateHomeScore}
          decreaseAccessibilityLabel={t('Decrease home score')}
          increaseAccessibilityLabel={t('Increase home score')}
          disabled={isPending}
        />

        <ScoreStepper
          value={awayScore}
          onChange={updateAwayScore}
          decreaseAccessibilityLabel={t('Decrease away score')}
          increaseAccessibilityLabel={t('Increase away score')}
          disabled={isPending}
        />
      </View>
      <Button
        label={saveLabel}
        intent="primary"
        size="md"
        onPress={() => void handleSave()}
        disabled={!canSave || isPending}
        loading={isPending}
      />
    </View>
  );
}
