import { useGetLeaguePredictionsByFixture } from '@/hooks/usePredictions';
import { useMemberStore } from '@/store/MemberStore';
import { PredictionLeaderboardType } from '@/types';
import { FlatList, Text, View } from 'react-native';
import { LoadingOverlay } from '../layout';
import { PredictionsLeaderCard } from './PredictionsLeaderCard';

const FinishContent = ({ match_id }: { match_id: number }) => {
  const { member } = useMemberStore();
  const {
    data: leaguePredictions,
    isLoading,
    error,
    refetch,
  } = useGetLeaguePredictionsByFixture(match_id);

  if (isLoading) return <LoadingOverlay />;
  if (error) console.log('error', error);

  return (
    <View className="flex-1 bg-surface rounded-xl p-4 mb-4">
      <Text className="text-xl font-bold text-primary mb-2">
        League Predictions
      </Text>
      <Text className="text-sm text-muted mb-4">
        See how your friends predicted this match
      </Text>

      {leaguePredictions?.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-2xl text-text ">
            No predictions found
          </Text>
        </View>
      ) : (
        <>
          {/* Header Row */}
          <View className="flex-row items-center justify-between py-2 border-b border-border mb-2">
            <Text className="text-sm font-medium text-muted">Player</Text>
            <View className="flex-row">
              <Text className="text-sm font-medium text-muted mr-6">
                Prediction
              </Text>
              <Text className="text-sm font-medium text-muted">Points</Text>
            </View>
          </View>

          <FlatList
            data={leaguePredictions}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <PredictionsLeaderCard
                item={item as PredictionLeaderboardType}
                index={index + 1}
                currentUserId={member?.user_id || ''}
              />
            )}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={() => {
              refetch();
            }}
          />
        </>
      )}
    </View>
  );
};

export default FinishContent;
