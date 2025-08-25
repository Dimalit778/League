import { useGetLeaguePredictionsByFixture } from '@/hooks/usePredictions';
import { FixturesWithTeams } from '@/types';
import { FlatList, Text, View } from 'react-native';
import { LoadingOverlay } from '../layout';

type PredictionLeaderboardType = {
  id: string;
  user_id: string;
  league_id: string;
  fixture_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
  member: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  };
};

const FinishContent = ({ match }: { match: FixturesWithTeams }) => {
  const date = new Date();

  const {
    data: leaguePredictions,
    isLoading: leaguePredictionsLoading,
    error: leaguePredictionsError,
  } = useGetLeaguePredictionsByFixture(match.id);

  if (leaguePredictionsError) console.log('error', leaguePredictionsError);
  if (leaguePredictionsLoading) return <LoadingOverlay />;

  return (
    <View className="flex-1 bg-surface rounded-xl p-4 mb-4">
      <Text className="text-xl font-bold text-text mb-2">
        League Predictions
      </Text>
      <Text className="text-sm text-textMuted mb-4">
        See how your friends predicted this match
      </Text>

      {/* Header Row */}
      <View className="flex-row items-center justify-between py-2 border-b border-gray-200 mb-2">
        <Text className="text-sm font-medium text-textMuted">Player</Text>
        <View className="flex-row">
          <Text className="text-sm font-medium text-textMuted mr-6">
            Prediction
          </Text>
          <Text className="text-sm font-medium text-textMuted">Points</Text>
        </View>
      </View>

      <FlatList
        data={leaguePredictions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item, index }) => (
          <Card item={item} index={index + 1} userId={item.user_id} />
        )}
      />
    </View>
  );
};
const Card = ({
  item,
  index,
  userId,
}: {
  item: PredictionLeaderboardType;
  index: number;
  userId: string;
}) => {
  const getScoreBorderColor = (points: number | null) => {
    if (points === null) return 'border-border';
    if (points === 5) return 'border-green-500';
    if (points === 3) return 'border-gray-400';
    return 'border-red-500';
  };

  return (
    <View
      className={`flex-row items-center justify-between bg-surface rounded-lg p-3 shadow-md border border-border gap-4 h-16 w-full ${
        userId === item.user_id ? 'bg-primary' : 'bg-surface'
      }`}
    >
      {/* Position */}
      <View className="w-6 h-6 rounded-lg  flex items-center justify-center border border-border">
        <Text className="text-sm text-secondary">{index}</Text>
      </View>
      {/* Nickname */}
      <Text className="text-sm text-text font-bold">
        {item.member.nickname}
      </Text>

      {/* Score */}
      <View className="flex-1 flex-row items-center justify-end gap-5">
        <View className="flex-row gap-2 border border-border rounded-lg p-2 items-center justify-center">
          <Text className="text-sm text-text ">
            {item.home_score} - {item.away_score}
          </Text>
        </View>
        {/* Points */}
        <View
          className={`rounded-full w-8 h-8 flex items-center justify-center border border-border ${getScoreBorderColor(item.points)}`}
        >
          <Text className="text-text font-bold text-sm">
            {item.points ?? 0}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FinishContent;
