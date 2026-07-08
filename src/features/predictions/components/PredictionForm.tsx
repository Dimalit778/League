import { Text } from '@/components/ui';
import { PredictionMemberType } from '@/features/matches/types';
import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useTranslation } from '@/hooks/useTranslation';
import { selectMemberId, useMemberStore } from '@/store/MemberStore';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
type PredictionFormProps = {
  prediction?: PredictionMemberType;
  matchId: number;
};

type ScoreInputProps = {
  value: number;
  accessibilityLabel: string;
  onChange: (value: number) => void;
  onEditingEnd: () => void;
};

const ScoreInput = ({ value, accessibilityLabel, onChange, onEditingEnd }: ScoreInputProps) => {
  const handleChangeText = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    onChange(digitsOnly ? Math.min(Number(digitsOnly), 99) : 0);
  };

  return (
    <TextInput
      value={value.toString()}
      onChangeText={handleChangeText}
      onBlur={onEditingEnd}
      onEndEditing={onEditingEnd}
      keyboardType="number-pad"
      maxLength={2}
      selectTextOnFocus
      className="h-14 w-14 rounded-lg border border-white/60 bg-white/10 text-center text-2xl font-bold text-white"
      accessibilityLabel={accessibilityLabel}
    />
  );
};

export default function PredictionForm({ prediction, matchId }: PredictionFormProps) {
  const { t } = useTranslation();
  const memberId = useMemberStore(selectMemberId);
  const scoresRef = useRef({ homeScore: 0, awayScore: 0 });
  const lastSubmittedRef = useRef<{ homeScore: number | null; awayScore: number | null }>({
    homeScore: null,
    awayScore: null,
  });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);

  const upsertPrediction = useUpsertPrediction();

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.home_score);
      setAwayScore(prediction.away_score);
      scoresRef.current = { homeScore: prediction.home_score, awayScore: prediction.away_score };
      lastSubmittedRef.current = { homeScore: prediction.home_score, awayScore: prediction.away_score };
    } else {
      setHomeScore(0);
      setAwayScore(0);
      scoresRef.current = { homeScore: 0, awayScore: 0 };
      lastSubmittedRef.current = { homeScore: null, awayScore: null };
    }
  }, [prediction]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (!matchId || !memberId) {
      return;
    }

    const currentScores = scoresRef.current;
    if (
      lastSubmittedRef.current.homeScore === currentScores.homeScore &&
      lastSubmittedRef.current.awayScore === currentScores.awayScore
    ) {
      return;
    }

    lastSubmittedRef.current = { ...currentScores };

    try {
      await upsertPrediction.mutateAsync({
        match_id: matchId,
        home_score: currentScores.homeScore,
        away_score: currentScores.awayScore,
        league_member_id: memberId,
      });
    } catch {
      lastSubmittedRef.current = {
        homeScore: prediction?.home_score ?? null,
        awayScore: prediction?.away_score ?? null,
      };
    }
  };

  const scheduleSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 600);
  };

  const handleHomeScoreChange = (value: number) => {
    scoresRef.current = { ...scoresRef.current, homeScore: value };
    setHomeScore(value);
    scheduleSave();
  };

  const handleAwayScoreChange = (value: number) => {
    scoresRef.current = { ...scoresRef.current, awayScore: value };
    setAwayScore(value);
    scheduleSave();
  };

  return (
    <View className="items-center justify-center px-2">
      {/* Score Inputs */}
      <View className="flex-row items-center justify-center gap-2">
        <ScoreInput
          value={homeScore}
          onChange={handleHomeScoreChange}
          onEditingEnd={handleSave}
          accessibilityLabel={t('Home score')}
        />
        <Text variant="h2" className="text-white">
          -
        </Text>
        <ScoreInput
          value={awayScore}
          onChange={handleAwayScoreChange}
          onEditingEnd={handleSave}
          accessibilityLabel={t('Away score')}
        />
      </View>
    </View>
  );
}
