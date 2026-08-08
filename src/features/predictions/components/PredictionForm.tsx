import { Text } from '@/components';
import { PredictionWithMemberType } from '@/features/matches/types';

import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';

const SCORE_INPUT_SIZE = 48;
const SCORE_FONT_SIZE = 24;

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

type ScoreInputProps = {
  value: number | null;
  accessibilityLabel: string;
  onChange: (value: number | null) => void;
  onDigitEntered?: () => void;
};

const ScoreInput = forwardRef<TextInput, ScoreInputProps>(function ScoreInput(
  { value, accessibilityLabel, onChange, onDigitEntered },
  ref,
) {
  const handleChangeText = (text: string) => {
    const digit = text.replace(/\D/g, '').slice(-1);

    if (!digit) {
      onChange(null);
      return;
    }

    onChange(Number(digit));
    onDigitEntered?.();
  };

  return (
    <TextInput
      ref={ref}
      value={value === null ? '' : String(value)}
      placeholderTextColor="rgba(255,255,255,0.45)"
      onChangeText={handleChangeText}
      keyboardType="number-pad"
      maxLength={1}
      selectTextOnFocus
      allowFontScaling
      maxFontSizeMultiplier={1.5}
      className="rounded-xl border border-white/40 bg-black/20 text-center font-bold text-white"
      style={{
        width: SCORE_INPUT_SIZE,
        height: SCORE_INPUT_SIZE,
        fontSize: SCORE_FONT_SIZE,
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: value === null ? '' : String(value) }}
    />
  );
});

const PredictionForm = forwardRef<PredictionFormHandle, PredictionFormProps>(function PredictionForm(
  { prediction, matchId, onSaveSuccess, onDraftChange },
  ref,
) {
  const { t } = useTranslation();
  const memberId = useMemberId();
  const awayScoreInputRef = useRef<TextInput>(null);
  const [homeScore, setHomeScore] = useState<number | null>(prediction?.home_score ?? null);

  const [awayScore, setAwayScore] = useState<number | null>(prediction?.away_score ?? null);
  const [savedScores, setSavedScores] = useState<{ home: number; away: number } | null>(
    prediction ? { home: prediction.home_score, away: prediction.away_score } : null,
  );

  const upsertPrediction = useUpsertPrediction();

  const bothScoresSet = homeScore !== null && awayScore !== null;
  const hasChanges =
    bothScoresSet && (savedScores === null || homeScore !== savedScores.home || awayScore !== savedScores.away);

  useEffect(() => {
    onDraftChange?.({ hasChanges, isPending: upsertPrediction.isPending });
  }, [hasChanges, onDraftChange, upsertPrediction.isPending]);

  const handleSave = useCallback(async () => {
    if (
      !matchId ||
      !memberId ||
      !hasChanges ||
      homeScore === null ||
      awayScore === null ||
      upsertPrediction.isPending
    ) {
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
      onSaveSuccess?.();
    } catch {
      // Alert handled in useUpsertPrediction
    }
  }, [awayScore, hasChanges, homeScore, matchId, memberId, onSaveSuccess, upsertPrediction]);

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

  return (
    <View className="items-center justify-center">
      <View className="flex-row items-center justify-center">
        <ScoreInput
          value={homeScore}
          onChange={setHomeScore}
          accessibilityLabel={t('Home score')}
          onDigitEntered={() => awayScoreInputRef.current?.focus()}
        />
        <Text variant="label" className="mx-1.5 text-2xl text-white/70">
          -
        </Text>
        <ScoreInput
          ref={awayScoreInputRef}
          value={awayScore}
          onChange={setAwayScore}
          accessibilityLabel={t('Away score')}
          onDigitEntered={Keyboard.dismiss}
        />
      </View>
    </View>
  );
});

export default PredictionForm;
