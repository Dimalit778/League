import {
  useCreatePrediction,
  useGetPredictionByUserAndFixture,
  useUpdatePrediction,
} from '@/hooks/usePredictions';
import { FixturesWithTeams } from '@/types';
import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { LoadingOverlay } from '../layout';
import { Button } from '../ui';

interface ScheduledContentProps {
  match: FixturesWithTeams;
}

const ScheduledContent = ({ match }: ScheduledContentProps) => {
  const { data: prediction, isLoading } = useGetPredictionByUserAndFixture(
    match.id
  );

  // State management
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalHomeScore, setOriginalHomeScore] = useState('');
  const [originalAwayScore, setOriginalAwayScore] = useState('');

  // Mutations
  const {
    mutate: createPrediction,
    isPending: isCreating,
    isSuccess: createSuccess,
    isError: createError,
  } = useCreatePrediction(match.id);

  const {
    mutate: updatePrediction,
    isPending: isUpdating,
    isSuccess: updateSuccess,
    isError: updateError,
  } = useUpdatePrediction(match.id);

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
  const handleSave = () => {
    const homeScoreNum = Number(homeScore) || 0;
    const awayScoreNum = Number(awayScore) || 0;

    createPrediction({
      fixture_id: match.id,
      home_score: homeScoreNum,
      away_score: awayScoreNum,
    });
  };

  const handleUpdate = () => {
    const homeScoreNum = Number(homeScore) || 0;
    const awayScoreNum = Number(awayScore) || 0;

    updatePrediction({
      prediction_id: prediction!.id,
      home_score: homeScoreNum,
      away_score: awayScoreNum,
    });
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

  // Reset editing state after successful operations
  useEffect(() => {
    if (createSuccess || updateSuccess) {
      setIsEditing(false);
      // Update original scores after successful update
      if (updateSuccess) {
        setOriginalHomeScore(homeScore);
        setOriginalAwayScore(awayScore);
      }
    }
  }, [createSuccess, updateSuccess, homeScore, awayScore]);

  // Loading state
  if (isLoading) return <LoadingOverlay />;

  const hasError = createError || updateError;
  const isProcessing = isCreating || isUpdating;
  const showSuccess = createSuccess || updateSuccess;

  return (
    <View className="bg-background p-4 rounded-lg shadow-md">
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
            loading={isCreating}
            disabled={isCreating || !homeScore || !awayScore}
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
                loading={isUpdating}
                disabled={isUpdating}
                variant="primary"
                size="md"
              />
            </View>
            <View className="flex-1">
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="error"
                size="md"
              />
            </View>
          </View>
        )}
      </View>

      {/* Status Messages */}
      {showSuccess && (
        <Text className="mt-3 text-center text-green-500 font-medium">
          {createSuccess ? 'Prediction saved!' : 'Prediction updated!'}
        </Text>
      )}

      {hasError && (
        <Text className="mt-3 text-center text-red-500 font-medium">
          {createError
            ? 'Error saving prediction'
            : 'Error updating prediction'}
        </Text>
      )}
    </View>
  );
};

export default ScheduledContent;
