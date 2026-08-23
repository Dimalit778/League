import { Text } from '@/components';
import type { MemberPrediction } from '@/features/matches/types';

import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Check, Minus, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const MIN_SCORE = 0;
const MAX_SCORE = 9;
const STEPPER_WIDTH = 140;
const STEPPER_HEIGHT = 52;
const ICON_COLOR = '#D7DCE7';
const SAVED_FLASH_MS = 1200;
const SAVE_BUTTON_SIZE = 70;
const SAVE_BUTTON_COMPACT_SIZE = 36;
const SAVE_BUTTON_SPRING = { damping: 100, stiffness: 50 };

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

type SaveButtonProps = {
  canSave: boolean;
  isPending: boolean;
  justSaved: boolean;
  label: string;
  saveText: string;
  iconColor: string;
  onSave: () => void;
};

function SaveButton({ canSave, isPending, justSaved, label, saveText, iconColor, onSave }: SaveButtonProps) {
  const expanded = canSave || isPending || justSaved;
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(expanded ? 1 : 0, SAVE_BUTTON_SPRING);
  }, [expanded, progress]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [SAVE_BUTTON_COMPACT_SIZE / SAVE_BUTTON_SIZE, 1]) }],
    opacity: interpolate(progress.value, [0, 1], [0.5, 1]),
  }));

  return (
    <View className="h-18 w-18 items-center justify-center">
      <Animated.View style={buttonStyle}>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !canSave, busy: isPending }}
          className="h-16 w-16 items-center justify-center rounded-full bg-primary"
        >
          {isPending ? (
            <ActivityIndicator color={iconColor} />
          ) : justSaved ? (
            <Check size={28} color={iconColor} strokeWidth={2.5} />
          ) : (
            <Text variant="label" tone="inverse" className="text-center">
              {saveText}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function PredictionForm({ prediction, matchId, onSaveSuccess }: PredictionFormProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const memberId = useMemberId();
  const [homeScore, setHomeScore] = useState(() => clampScore(prediction?.home_score ?? 0));
  const [awayScore, setAwayScore] = useState(() => clampScore(prediction?.away_score ?? 0));
  const [hasInteracted, setHasInteracted] = useState(false);
  const [savedScores, setSavedScores] = useState<{ home: number; away: number } | null>(
    prediction ? { home: clampScore(prediction.home_score), away: clampScore(prediction.away_score) } : null,
  );
  const [justSaved, setJustSaved] = useState(false);

  const upsertPrediction = useUpsertPrediction();
  const isPending = upsertPrediction.isPending;

  const hasChanges = savedScores ? homeScore !== savedScores.home || awayScore !== savedScores.away : hasInteracted;
  const canSave = hasChanges && !isPending;
  const saveLabel = isPending ? t('Saving') : justSaved ? t('Saved') : t('Save');

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
      setSavedScores({ home: homeScore, away: awayScore });
      setHasInteracted(false);
      setJustSaved(true);
      onSaveSuccess?.();
    } catch {
      // Alert handled in useUpsertPrediction
    }
  }, [awayScore, hasChanges, homeScore, isPending, matchId, memberId, onSaveSuccess, upsertPrediction]);

  const updateHomeScore = (value: number) => {
    setHomeScore(clampScore(value));
    setHasInteracted(true);
    setJustSaved(false);
  };

  const updateAwayScore = (value: number) => {
    setAwayScore(clampScore(value));
    setHasInteracted(true);
    setJustSaved(false);
  };

  return (
    <View className="w-full flex-row items-center justify-between ">
      <ScoreStepper
        value={homeScore}
        onChange={updateHomeScore}
        decreaseAccessibilityLabel={t('Decrease home score')}
        increaseAccessibilityLabel={t('Increase home score')}
        disabled={isPending}
      />
      <SaveButton
        canSave={canSave}
        isPending={isPending}
        justSaved={justSaved}
        label={saveLabel}
        saveText={t('Save')}
        iconColor={colors.onPrimary}
        onSave={() => void handleSave()}
      />
      <ScoreStepper
        value={awayScore}
        onChange={updateAwayScore}
        decreaseAccessibilityLabel={t('Decrease away score')}
        increaseAccessibilityLabel={t('Increase away score')}
        disabled={isPending}
      />
    </View>
  );
}
