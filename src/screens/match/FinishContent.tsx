import { LoadingOverlay } from '@/components/layout';
import { useGetLeaguePredictionsByFixture } from '@/hooks/usePredictions';
import { useMemberStore } from '@/store/MemberStore';
import { PredictionLeaderboardType } from '@/types';
import { FlatList, Text, View } from 'react-native';
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
            // Advanced performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={5} // Reduced for better performance
            windowSize={8} // Reduced window size
            initialNumToRender={5} // Render fewer items initially
            updateCellsBatchingPeriod={100} // Increased batching period
            getItemLayout={(_, index) => ({
              length: 80, // Approximate height of each prediction card
              offset: 80 * index,
              index,
            })}
            // Memory optimizations
            legacyImplementation={false}
            disableVirtualization={false}
            // Lazy loading optimizations
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 5,
            }}
          />
        </>
      )}
    </View>
  );
};

export default FinishContent;
