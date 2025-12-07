import { LoadingOverlay } from '@/components/layout';
import { BackButton, CText } from '@/components/ui';
import { useAdminLeagues } from '@/features/admin/hooks/useAdmin';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminLeaguesScreen = () => {
  const isFocused = useIsFocused();
  const { data, isLoading, isRefetching, refetch, error } = useAdminLeagues();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="League Management" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={isFocused && (isLoading || isRefetching)} onRefresh={onRefresh} />}
      >
        {error ? (
          <CText className="text-error text-base">Unable to load leagues. Pull to refresh to try again.</CText>
        ) : (
          <CText className="text-text text-sm mb-4">Showing {data?.length ?? 0} leagues.</CText>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((league) => (
            <View key={league.id} className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 mr-4">
                  <CText className="text-text text-lg font-semibold">{league.name}</CText>
                  <CText className="text-text/70 text-sm">{league.id}</CText>
                </View>
                <View>
                  <CText className="text-text/50 text-xs uppercase tracking-wide text-right">Join Code</CText>
                  <CText className="text-text text-base font-semibold">{league.join_code}</CText>
                </View>
              </View>

              <View className="flex-row mb-3">
                <View className="flex-1 mr-4">
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Owner</CText>
                  <CText className="text-text text-sm">{league.owner?.full_name ?? 'Unknown owner'}</CText>
                  <CText className="text-text/70 text-xs">{league.owner?.email ?? 'No email on file'}</CText>
                </View>
                <View className="flex-1">
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Competition</CText>
                  <CText className="text-text text-sm">{league.competition?.name ?? 'Not assigned'}</CText>
                  <CText className="text-text/70 text-xs">{league.competition?.country ?? ''}</CText>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Max Members</CText>
                  <CText className="text-text text-sm">{league.max_members}</CText>
                </View>
                <View className="items-end">
                  <CText className="text-text/50 text-xs uppercase tracking-wide">Created</CText>
                  <CText className="text-text text-sm">{new Date(league.created_at).toLocaleString()}</CText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminLeaguesScreen;
