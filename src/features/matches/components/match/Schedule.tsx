import { Button } from '@/components/ui';
import { PredictionsMemberType } from '@/features/matches/types';
import { useCreatePrediction, useUpdatePrediction } from '@/features/predictions/hooks/usePredictions';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

export default function Schedule({ prediction, matchId }: { prediction?: PredictionsMemberType; matchId: number }) {
  const router = useRouter();

  const [homeScore, setHomeScore] = useState<number | undefined>(undefined);
  const [awayScore, setAwayScore] = useState<number | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHomeScore, setOriginalHomeScore] = useState<number | undefined>(undefined);
  const [originalAwayScore, setOriginalAwayScore] = useState<number | undefined>(undefined);

  const createPrediction = useCreatePrediction();
  const updatePrediction = useUpdatePrediction(prediction?.id ?? '');

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.home_score);
      setAwayScore(prediction.away_score);
      setOriginalHomeScore(prediction.home_score);
      setOriginalAwayScore(prediction.away_score);
      setIsEditing(false);
    } else {
      setHomeScore(undefined);
      setAwayScore(undefined);
      setIsEditing(true);
    }
  }, [prediction]);

  const handleSave = async () => {
    try {
      await createPrediction.mutateAsync({
        match_id: matchId,
        home_score: homeScore ?? 0,
        away_score: awayScore ?? 0,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to create prediction');
      console.error('Failed to create prediction:', err);
    }
  };

  const handleUpdate = async () => {
    const homeScoreNum = homeScore ?? 0;
    const awayScoreNum = awayScore ?? 0;

    try {
      await updatePrediction.mutateAsync({
        id: prediction!.id,
        home_score: homeScoreNum,
        away_score: awayScoreNum,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update prediction');
      console.error('Failed to update prediction:', err);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setHomeScore(originalHomeScore);
    setAwayScore(originalAwayScore);
    setIsEditing(false);
  };

  const isProcessing = createPrediction.isPending || updatePrediction.isPending;
  const hasError = createPrediction.isError || updatePrediction.isError;

  return (
    <View className="flex-1 bg-background">
      <Text className="text-text text-center text-2xl font-nunito-black">
        {prediction ? 'My Prediction' : 'Enter your prediction'}
      </Text>

      {/* Score Inputs */}
      <View className="flex-row items-center justify-center mt-10">
        <View className="w-16 h-12 border border-text rounded-md bg-surface justify-center">
          <TextInput
            className="text-center text-lg text-text flex-1"
            keyboardType="numeric"
            value={awayScore === undefined ? '' : awayScore.toString()}
            onChangeText={(text) => setHomeScore(text === '' ? undefined : Number(text))}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            maxLength={2}
            editable={isEditing}
            style={{ lineHeight: 20, width: '100%', height: '100%' }}
          />
        </View>
        <Text className="mx-4 text-lg font-bold text-primary">-</Text>
        <View className="w-16 h-12 border border-text rounded-md bg-surface justify-center">
          <TextInput
            className="text-center text-lg text-text flex-1"
            keyboardType="numeric"
            value={awayScore === undefined ? '' : awayScore.toString()}
            onChangeText={(text) => setAwayScore(text === '' ? undefined : Number(text))}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            maxLength={2}
            editable={isEditing}
            style={{ lineHeight: 20, width: '100%', height: '100%' }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="mt-10">
        {!prediction && (
          <Button
            title="Save Prediction"
            onPress={handleSave}
            loading={createPrediction.isPending}
            disabled={isProcessing || !homeScore || !awayScore}
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
                title="Update"
                onPress={handleUpdate}
                loading={updatePrediction.isPending}
                disabled={isProcessing}
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

      {/* Status Messages */}
      {(createPrediction.isSuccess || updatePrediction.isSuccess) && (
        <Text className="mt-3 text-center text-green-500 font-medium">
          {createPrediction.isSuccess ? 'Prediction saved!' : 'Prediction updated!'}
        </Text>
      )}

      {hasError && (
        <Text className="mt-3 text-center text-red-500 font-medium">
          {createPrediction.isError ? 'Error saving prediction' : 'Error updating prediction'}
        </Text>
      )}
    </View>
  );
}
