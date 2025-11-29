import { Button } from '@/components/ui';
import { PredictionMemberType } from '@/features/matches/types';
import { useUpsertPrediction } from '@/features/predictions/hooks/usePredictions';
import { useMemberStore } from '@/store/MemberStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
type PredictionFormProps = {
  prediction?: PredictionMemberType;
  matchId: number;
};

export default function PredictionForm({ prediction, matchId }: PredictionFormProps) {
  const memberId = useMemberStore((s) => s.memberId);
  const router = useRouter();
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHomeScore, setOriginalHomeScore] = useState<number | null>(null);
  const [originalAwayScore, setOriginalAwayScore] = useState<number | null>(null);

  const awayScoreInputRef = useRef<TextInput>(null);
  const upsertPrediction = useUpsertPrediction();

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.home_score);
      setAwayScore(prediction.away_score);
      setOriginalHomeScore(prediction.home_score);
      setOriginalAwayScore(prediction.away_score);
      setIsEditing(false);
    } else {
      setHomeScore(null);
      setAwayScore(null);
      setIsEditing(true);
    }
  }, [prediction]);

  const handleSave = async () => {
    if (homeScore === null || awayScore === null || !matchId || !memberId) {
      return;
    }
    try {
      await upsertPrediction.mutateAsync({
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        league_member_id: memberId,
      });
      setIsEditing(false);
      if (!prediction) {
        router.back();
      }
    } catch (error) {
      console.error('Failed to save prediction:', error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setHomeScore(originalHomeScore);
    setAwayScore(originalAwayScore);
    setIsEditing(false);
  };

  return (
    <View className="flex-1 ">
      <View className="">
        <Text className="text-text text-center text-2xl font-nunito-black">
          {prediction ? 'My Prediction' : 'Enter your prediction'}
        </Text>
      </View>
      {/* Score Inputs */}
      <View className="flex-row justify-center bg-surface">
        <View className="w-16 h-12 border border-text rounded-md bg-surface justify-center">
          <TextInput
            className="text-center text-lg text-text flex-1"
            keyboardType="numeric"
            value={homeScore === null ? '' : homeScore.toString()}
            onChangeText={(text) => {
              if (text === '') {
                setHomeScore(null);
              } else if (/^[0-9]$/.test(text)) {
                setHomeScore(Number(text));

                awayScoreInputRef.current?.focus();
              }
            }}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            maxLength={1}
            editable={isEditing}
            style={{ lineHeight: 20, width: '100%', height: '100%' }}
          />
        </View>
        <Text className="mx-4 text-lg font-bold text-primary">-</Text>
        <View className="w-16 h-12 border border-text rounded-md bg-surface justify-center">
          <TextInput
            ref={awayScoreInputRef}
            className="text-center text-lg text-text flex-1"
            keyboardType="numeric"
            value={awayScore === null ? '' : awayScore.toString()}
            onChangeText={(text) => {
              if (text === '') {
                setAwayScore(null);
              } else if (/^[0-9]$/.test(text)) {
                setAwayScore(Number(text));
              }
            }}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            maxLength={1}
            editable={isEditing}
            style={{ lineHeight: 20, width: '100%', height: '100%' }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="">
        {!prediction && (
          <Button
            title="Save Prediction"
            onPress={handleSave}
            loading={upsertPrediction.isPending}
            disabled={upsertPrediction.isPending || homeScore === null || awayScore === null}
            variant="primary"
            size="md"
          />
        )}

        {prediction && !isEditing && (
          <Button title="Edit Prediction" onPress={handleEdit} variant="secondary" size="md" />
        )}

        {prediction && isEditing && (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Save"
                onPress={handleSave}
                loading={upsertPrediction.isPending}
                disabled={upsertPrediction.isPending || homeScore === null || awayScore === null}
                variant="primary"
                size="md"
              />
            </View>
            <View className="flex-1">
              <Button title="Cancel" onPress={handleCancel} variant="secondary" size="md" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
