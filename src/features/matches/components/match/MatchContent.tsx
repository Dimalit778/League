import { LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useCreatePrediction, useMemberPredictionByFixture, useUpdatePrediction } from '@/features/predictions/hooks/usePredictions';
import { MatchType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import FinishedMatch from './FinishedMatch';

interface MatchContentProps {
  match: MatchType;
}

type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'FINISHED';

export default function MatchContent({ match }: MatchContentProps) {
  const status = (match.status ?? 'SCHEDULED') as MatchStatus;
  const isScheduled = ['SCHEDULED', 'TIMED'].includes(status) && new Date(match.kick_off) > new Date();
  const isLive = status === 'IN_PLAY';

  if (isScheduled) {
    return <ScheduledMatchContent match={match} />;
  }

  if (isLive) {
    return <LiveMatchContent match={match} />;
  }

  return <FinishedMatch matchId={match.id} />;
}

// Scheduled Match Content - Prediction Input
const ScheduledMatchContent = ({ match }: { match: MatchType }) => {
  const router = useRouter();
  const { data: prediction, isLoading } = useMemberPredictionByFixture(match.id);

  const [homeScore, setHomeScore] = useState<number | undefined>(undefined);
  const [awayScore, setAwayScore] = useState<number | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHomeScore, setOriginalHomeScore] = useState<number | undefined>(undefined);
  const [originalAwayScore, setOriginalAwayScore] = useState<number | undefined>(undefined);

  const createPrediction = useCreatePrediction();
  const updatePrediction = useUpdatePrediction();

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
        fixture_id: match.id,
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

  if (isLoading) return <LoadingOverlay />;

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
};

// Live Match Content - Live Events
const LiveMatchContent = ({ match }: { match: MatchType }) => {
  // TODO: Replace with actual live events data from API
  const events = [
    {
      id: 1,
      type: 'goal',
      player: 'John Doe',
      details: 'Scored a goal',
      time: '10',
    },
  ];

  const getEventIcon = (type: string) => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      goal: 'football',
      'yellow-card': 'alert-circle',
      'red-card': 'alert-circle',
      substitution: 'person-add',
      penalty: 'football',
    };
    return iconMap[type] || 'information-circle';
  };

  return (
    <View className="bg-surface rounded-2xl overflow-hidden">
      <View className="bg-primary/10 p-4 flex-row items-center">
        <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
          <Ionicons name="radio" size={20} color="white" />
        </View>
        <Text className="text-text text-xl font-bold ml-3">Live Events</Text>
        <View className="ml-auto bg-red-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">● LIVE</Text>
        </View>
      </View>

      <View className="p-4">
        {events.length === 0 ? (
          <Text className="text-center text-textMuted py-4">No live events yet</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} className="flex-row items-center py-3 border-b border-border/20 last:border-b-0">
              <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
                <Ionicons name={getEventIcon(event.type)} size={16} color="#6366F1" />
              </View>

              <View className="flex-1">
                <Text className="text-text font-semibold">{event.player}</Text>
                {event.details && <Text className="text-textMuted text-sm">{event.details}</Text>}
              </View>

              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-primary font-bold text-sm">{event.time}'</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};
