import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { useAdminPredictions } from '@/hooks/useAdmin';
import { useCallback } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

const AdminPredictions = () => {
  const { data, isLoading, isRefetching, refetch, error } =
    useAdminPredictions();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Predictions" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        {error ? (
          <Text className="text-error text-base">
            Unable to load predictions. Pull to refresh to try again.
          </Text>
        ) : (
          <Text className="text-text text-sm mb-4">
            Showing {data?.length ?? 0} recent predictions (latest 200 records).
          </Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((prediction) => (
            <View
              key={prediction.id}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-text text-lg font-semibold">
                    {prediction.league?.name ?? 'Unknown League'}
                  </Text>
                  <Text className="text-text/70 text-sm">
                    {prediction.member?.nickname ?? 'Unknown member'}
                  </Text>
                  <Text className="text-text/50 text-xs">
                    {prediction.user?.full_name ?? 'Unknown user'} ·{' '}
                    {prediction.user?.email ?? 'No email'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Points
                  </Text>
                  <Text className="text-text text-xl font-semibold">
                    {prediction.points}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Predicted Score
                  </Text>
                  <Text className="text-text text-sm">
                    {prediction.home_score} - {prediction.away_score}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Status
                  </Text>
                  <Text className="text-text text-sm">
                    {prediction.is_finished ? 'Finished' : 'Pending'}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Fixture ID
                  </Text>
                  <Text className="text-text text-sm">{prediction.fixture_id}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Submitted
                  </Text>
                  <Text className="text-text text-sm">
                    {new Date(prediction.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminPredictions;
