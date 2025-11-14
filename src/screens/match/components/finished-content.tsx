import { Error, LoadingOverlay } from '@/components/layout';
import { useGetLeaguePredictionsByFixture } from '@/hooks/usePredictions';
import { useStoreData } from '@/store/store';
import { useIsFocused } from '@react-navigation/native';
import { FlatList, Text, View } from 'react-native';
import PredictionsLeaderCard from './prediction-card';

interface FinishContentProps {
  match_id: number;
}
export default function FinishContent({ match_id }: FinishContentProps) {
  const { member } = useStoreData();
  const isFocused = useIsFocused();
  const { data: leaguePredictions, isLoading, error, refetch } = useGetLeaguePredictionsByFixture(match_id);

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;

  return (
    <View className="flex-1 bg-surface rounded-xl p-4 mb-4">
      <Text className="text-xl font-bold text-primary mb-2">League Predictions</Text>
      <Text className="text-sm text-muted mb-4">See how your friends predicted this match</Text>

      {leaguePredictions?.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-2xl text-text ">No predictions found</Text>
        </View>
      ) : (
        <>
          {/* Header Row */}
          <View className="flex-row items-center justify-between py-2 border-b border-border mb-2">
            <Text className="text-sm font-medium text-muted">Player</Text>
            <View className="flex-row">
              <Text className="text-sm font-medium text-muted mr-6">Prediction</Text>
              <Text className="text-sm font-medium text-muted">Points</Text>
            </View>
          </View>

          <FlatList
            data={leaguePredictions}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <PredictionsLeaderCard item={item} index={index + 1} currentUserId={member?.user_id || ''} />
            )}
            showsVerticalScrollIndicator={false}
            refreshing={isFocused && isLoading}
            onRefresh={() => {
              refetch();
            }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={8}
            initialNumToRender={5}
            updateCellsBatchingPeriod={100}
            getItemLayout={(_, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
            legacyImplementation={false}
            disableVirtualization={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 5,
            }}
          />
        </>
      )}
    </View>
  );
}
