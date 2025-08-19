import { usePredictionByFixture } from '@/hooks/usePredictions';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput, View } from 'react-native';
import LoadingOverlay from '../layout/LoadingOverlay';
import { Button } from '../ui';
import { LeagueLeaderboard } from './LeagueLeaderboard';
import { MatchPredictions } from './MatchPredictions';

interface MatchFinishedProps {
  match: any;
}
interface MatchLiveProps {
  events: any;
  getEventIcon: (type: string) => string;
}

interface MatchNotStartedProps {
  homeScorePrediction: string;
  setHomeScorePrediction: (value: string) => void;
  awayScorePrediction: string;
  setAwayScorePrediction: (value: string) => void;
  predictionSaved: boolean;
  handleSavePrediction: () => void;
  canPredict: boolean;
  isSaving: boolean;
}

const MatchFinished = ({ match }: MatchFinishedProps) => {
  const {
    data: userPrediction,
    isLoading,
    error,
  } = usePredictionByFixture(match.id);
  console.log('userPrediction---', JSON.stringify(userPrediction, null, 2));

  if (error) console.log('error', error);

  if (isLoading) return <LoadingOverlay />;

  return (
    <View className="space-y-4">
      {/* Final Result */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        className="rounded-2xl p-6"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="trophy" size={20} color="white" />
          </View>
          <Text className="text-white text-xl font-bold ml-3">
            Final Result
          </Text>
        </View>

        <View className="flex-row items-center justify-center">
          <Text className="text-white text-4xl font-black">
            {match.goals_home ?? 0}
          </Text>
          <Text className="text-white/70 text-3xl mx-4">-</Text>
          <Text className="text-white text-4xl font-black">
            {match.goals_away ?? 0}
          </Text>
        </View>
      </LinearGradient>

      {/* User Prediction Result */}
      {userPrediction && (
        <View className="bg-surface rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
              <Ionicons name="person" size={20} color="white" />
            </View>
            <Text className="text-text text-xl font-bold ml-3">
              Your Prediction
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="text-textMuted text-sm mb-1">
                Your Prediction
              </Text>
              <Text className="text-text text-2xl font-bold">
                {userPrediction.predicted_home_score} -{' '}
                {userPrediction.predicted_away_score}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-textMuted text-sm mb-1">Points Earned</Text>
              <LinearGradient
                colors={
                  userPrediction.points > 0
                    ? ['#10B981', '#059669']
                    : ['#6B7280', '#9CA3AF']
                }
                className="rounded-xl px-4 py-2"
              >
                <Text className="text-white text-xl font-bold">
                  {userPrediction.points} pts
                </Text>
              </LinearGradient>
            </View>
          </View>

          <View className="mt-4 p-4 bg-primary/10 rounded-xl">
            <Text className="text-center text-textMuted">
              {userPrediction.points === 10
                ? '🎉 Perfect prediction!'
                : userPrediction.points === 3
                  ? '👍 Correct result!'
                  : '😕 Better luck next time!'}
            </Text>
          </View>
        </View>
      )}

      {/* Match Predictions */}
      <MatchPredictions fixtureId={match.id} />

      {/* League Leaderboard */}
      <LeagueLeaderboard />
    </View>
  );
};

const MatchLive = ({ events, getEventIcon }: MatchLiveProps) => (
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
      {events.map((event: any, index: any) => (
        <View
          key={event.id}
          className="flex-row items-center py-3 border-b border-border/20 last:border-b-0"
        >
          <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
            <Ionicons
              name={getEventIcon(event.type) as any}
              size={16}
              color="#6366F1"
            />
          </View>

          <View className="flex-1">
            <Text className="text-text font-semibold">{event.player}</Text>
            {event.details && (
              <Text className="text-textMuted text-sm">{event.details}</Text>
            )}
          </View>

          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary font-bold text-sm">
              {event.time}'
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const MatchNotStarted = ({
  homeScorePrediction,
  setHomeScorePrediction,
  awayScorePrediction,
  setAwayScorePrediction,
  predictionSaved,
  handleSavePrediction,
  canPredict,
  isSaving,
}: MatchNotStartedProps) => {
  return (
    <View className="p-6">
      <Text className="text-text text-xl font-semibold text-center mb-5">
        Make Your Prediction
      </Text>

      {!canPredict ? (
        <View className="items-center">
          <View className="bg-red-500/20 rounded-2xl p-6 items-center mb-4">
            <Ionicons name="time-outline" size={48} color="#EF4444" />
            <Text className="text-red-400 font-bold text-xl mt-2">
              Prediction Time Expired
            </Text>
            <Text className="text-text/80 text-center mt-2">
              The match is about to start. Predictions are no longer allowed.
            </Text>
          </View>
          {predictionSaved && (
            <View className="bg-white/10 rounded-xl p-4 mt-4">
              <Text className="text-text font-semibold text-center mb-2">
                Your Final Prediction:
              </Text>
              <Text className="text-text text-2xl font-bold text-center">
                {homeScorePrediction} - {awayScorePrediction}
              </Text>
            </View>
          )}
        </View>
      ) : !predictionSaved ? (
        <View className="flex-1">
          <View className="flex-row items-center justify-center mb-8">
            {/* Home Prediction */}
            <View className="items-center">
              <TextInput
                value={homeScorePrediction}
                onChangeText={setHomeScorePrediction}
                keyboardType="number-pad"
                maxLength={2}
                className="w-16 h-16 bg-white/20 rounded-xl text-center text-white text-2xl font-bold border border-white/30"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.5)"
                editable={canPredict}
              />
            </View>
            {/* VS */}
            <View className="items-center px-4">
              <Text className="text-white/60 text-lg font-bold">VS</Text>
            </View>
            {/* Away Prediction */}
            <View className="items-center">
              <TextInput
                value={awayScorePrediction}
                onChangeText={setAwayScorePrediction}
                keyboardType="number-pad"
                maxLength={2}
                className="w-16 h-16 bg-white/20 rounded-xl text-center text-white text-2xl font-bold border border-white/30"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.5)"
                editable={canPredict}
              />
            </View>
          </View>
          <View className="mt-10">
            <Button
              title={isSaving ? 'Saving...' : 'Save Prediction'}
              onPress={handleSavePrediction}
              disabled={!canPredict || isSaving}
            />
          </View>
        </View>
      ) : (
        <View className="items-center">
          <View className="bg-white/20 rounded-2xl p-6 items-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="white" />
            <Text className="text-white font-bold text-xl mt-2">
              Prediction Saved!
            </Text>
            <Text className="text-white/90 text-2xl font-bold mt-2">
              {homeScorePrediction} - {awayScorePrediction}
            </Text>
          </View>
          <Text className="text-white/80 text-center">
            Good luck with your prediction! 🍀
          </Text>
        </View>
      )}
    </View>
  );
};

export { MatchFinished, MatchLive, MatchNotStarted };
