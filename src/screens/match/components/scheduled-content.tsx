import { LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useCreatePrediction, useMemberPredictionByFixture, useUpdatePrediction } from '@/hooks/usePredictions';
import { MatchType } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

export default function ScheduledContent({ match }: { match: MatchType }) {
  const router = useRouter();
  const { data: prediction, isLoading } = useMemberPredictionByFixture(match.id);

  // State management
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHomeScore, setOriginalHomeScore] = useState<number>(0);
  const [originalAwayScore, setOriginalAwayScore] = useState<number>(0);

  // Mutations
  const createPrediction = useCreatePrediction();
  const updatePrediction = useUpdatePrediction();
  // Initialize state when prediction data loads
  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.home_score);
      setAwayScore(prediction.away_score);
      setOriginalHomeScore(prediction.home_score);
      setOriginalAwayScore(prediction.away_score);
      setIsEditing(false); // Show prediction, not editing
    } else {
      // No prediction - start in editing mode
      setHomeScore(0);
      setAwayScore(0);
      setIsEditing(true);
    }
  }, [prediction]);

  // Handlers
  const handleSave = async () => {
    try {
      await createPrediction.mutateAsync({
        fixture_id: match.id,
        home_score: homeScore,
        away_score: awayScore,
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create prediction');
      console.error('Failed to create prediction:', error);
    }
  };

  const handleUpdate = async () => {
    const homeScoreNum = Number(homeScore) || 0;
    const awayScoreNum = Number(awayScore) || 0;

    try {
      await updatePrediction.mutateAsync({
        id: prediction!.id,
        home_score: homeScoreNum,
        away_score: awayScoreNum,
      });

      // Navigate immediately on success
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update prediction');
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    setHomeScore(originalHomeScore);
    setAwayScore(originalAwayScore);
    setIsEditing(false);
  };

  if (isLoading) return <LoadingOverlay />;

  // Check for processing state and errors
  const isProcessing = createPrediction.isPending || updatePrediction.isPending;
  const hasError = createPrediction.isError || updatePrediction.isError;

  return (
    <View
      className="bg-background p-4 rounded-lg"
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Title */}
      <Text className="text-center text-xl mt-2 mb-4 text-text">
        {prediction ? 'My Prediction' : 'Enter your prediction'}
      </Text>

      {/* Score Inputs */}
      <View className="flex-row items-center justify-center my-5">
        <View className="w-16 h-12 border border-text rounded-md bg-surface justify-center">
          <TextInput
            className="text-center text-lg text-text"
            keyboardType="numeric"
            value={homeScore.toString()}
            onChangeText={(text) => setHomeScore(Number(text))}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            maxLength={2}
            editable={isEditing}
            style={{
              lineHeight: 20,
            }}
          />
        </View>

        <Text className="mx-4 text-lg font-bold text-primary">-</Text>

        <View className="w-16 h-12 border border-text rounded-md bg-surface justify-center">
          <TextInput
            className="text-center text-lg text-text"
            keyboardType="numeric"
            value={awayScore.toString()}
            onChangeText={(text) => setAwayScore(Number(text))}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            maxLength={2}
            editable={isEditing}
            style={{
              lineHeight: 20,
            }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="mt-4">
        {/* No prediction - Show Save button */}
        {!prediction && (
          <Button
            title="Save Prediction"
            onPress={handleSave}
            loading={createPrediction.isPending}
            disabled={createPrediction.isPending || !homeScore || !awayScore}
            variant="primary"
            size="md"
          />
        )}

        {/* Has prediction but not editing - Show Edit button */}
        {prediction && !isEditing && (
          <Button title="Edit Prediction" onPress={handleEdit} variant="secondary" size="md" />
        )}

        {/* Has prediction and editing - Show Update/Cancel buttons */}
        {prediction && isEditing && (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Update"
                onPress={handleUpdate}
                loading={updatePrediction.isPending}
                disabled={updatePrediction.isPending}
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
      {createPrediction.isSuccess ||
        (updatePrediction.isSuccess && (
          <Text className="mt-3 text-center text-green-500 font-medium">
            {createPrediction.isSuccess ? 'Prediction saved!' : 'Prediction updated!'}
          </Text>
        ))}

      {hasError && (
        <Text className="mt-3 text-center text-red-500 font-medium">
          {createPrediction.isError ? 'Error saving prediction' : 'Error updating prediction'}
        </Text>
      )}
    </View>
  );
}
