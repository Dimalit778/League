import { LoadingOverlay } from '@/components/layout';
import { BackButton, CText } from '@/components/ui';
import { useAdminPredictions } from '@/features/admin/hooks/useAdmin';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminPredictionsScreen = () => {
  const isFocused = useIsFocused();
  const { data, isLoading, isRefetching, refetch, error } = useAdminPredictions();

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
        refreshControl={<RefreshControl refreshing={isFocused && (isLoading || isRefetching)} onRefresh={onRefresh} />}
      >
        {error ? (
          <CText className="text-error text-base">Unable to load predictions. Pull to refresh to try again.</CText>
        ) : (
          <CText className="text-text text-sm mb-4">
            Showing {data?.length ?? 0} recent predictions (latest 200 records).
          </CText>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((prediction) => (
            <View key={prediction.id} className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <CText className="text-text text-lg font-semibold">
                    {prediction.league?.name ?? 'Unknown League'}
                  </CText>
                  <CText className="text-text/70 text-sm">{prediction.member?.nickname ?? 'Unknown member'}</CText>
                  <CText className="text-text/50 text-xs">
                    {prediction.user?.full_name ?? 'Unknown user'} · {prediction.user?.email ?? 'No email'}
                  </CText>
                </View>
                <View className="items-end">
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Points</CText>
                  <CText className="text-text text-xl font-semibold">{prediction.points}</CText>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View>
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Predicted Score</CText>
                  <CText className="text-text text-sm">
                    {prediction.home_score} - {prediction.away_score}
                  </CText>
                </View>
                <View className="items-end">
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Status</CText>
                  <CText className="text-text text-sm">{prediction.is_finished ? 'Finished' : 'Pending'}</CText>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Fixture ID</CText>
                  <CText className="text-text text-sm">{prediction.match_id}</CText>
                </View>
                <View className="items-end">
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Submitted</CText>
                  <CText className="text-text text-sm">{new Date(prediction.created_at ?? '').toLocaleString()}</CText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminPredictionsScreen;
