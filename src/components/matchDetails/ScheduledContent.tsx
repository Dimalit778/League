import {
  useCreatePrediction,
  useMemberPredictionByFixture,
  useUpdatePrediction,
} from '@/hooks/usePredictions';
import { FixturesWithTeamsType } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { LoadingOverlay } from '../layout';
import { Button } from '../ui';

const ScheduledContent = ({ match }: { match: FixturesWithTeamsType }) => {
  const router = useRouter();
  const { data: prediction, isLoading } = useMemberPredictionByFixture(
    match.id
  );

  // State management
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalHomeScore, setOriginalHomeScore] = useState('');
  const [originalAwayScore, setOriginalAwayScore] = useState('');

  // Mutations
  const createPrediction = useCreatePrediction();
  const updatePrediction = useUpdatePrediction();
  // Initialize state when prediction data loads
  useEffect(() => {
    if (prediction) {
      const homeScoreStr = prediction.home_score?.toString() || '0';
      const awayScoreStr = prediction.away_score?.toString() || '0';

      setHomeScore(homeScoreStr);
      setAwayScore(awayScoreStr);
      setOriginalHomeScore(homeScoreStr);
      setOriginalAwayScore(awayScoreStr);
      setIsEditing(false); // Show prediction, not editing
    } else {
      // No prediction - start in editing mode
      setHomeScore('');
      setAwayScore('');
      setIsEditing(true);
    }
  }, [prediction]);

  // Handlers
  const handleSave = async () => {
    const homeScoreNum = Number(homeScore) || 0;
    const awayScoreNum = Number(awayScore) || 0;

    try {
      await createPrediction.mutateAsync({
        fixture_id: match.id,
        home_score: homeScoreNum,
        away_score: awayScoreNum,
      });

      // Navigate immediately on success
      router.back();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.log('Failed to create prediction');
      // Optionally show an error toast/alert here
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
      // Error is handled by the mutation's onError callback
      console.log('Failed to update prediction');
      // Optionally show an error toast/alert here
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
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
            value={homeScore}
            onChangeText={setHomeScore}
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
            value={awayScore}
            onChangeText={setAwayScore}
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
          <Button
            title="Edit Prediction"
            onPress={handleEdit}
            variant="secondary"
            size="md"
          />
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
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                size="md"
              />
            </View>
          </View>
        )}
      </View>

      {/* Status Messages */}
      {createPrediction.isSuccess ||
        (updatePrediction.isSuccess && (
          <Text className="mt-3 text-center text-green-500 font-medium">
            {createPrediction.isSuccess
              ? 'Prediction saved!'
              : 'Prediction updated!'}
          </Text>
        ))}

      {hasError && (
        <Text className="mt-3 text-center text-red-500 font-medium">
          {createPrediction.isError
            ? 'Error saving prediction'
            : 'Error updating prediction'}
        </Text>
      )}
    </View>
  );
};

export default ScheduledContent;
