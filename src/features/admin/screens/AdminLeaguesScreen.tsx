import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Card, Text } from '@/components/ui';
import { useAdminLeagues } from '@/features/admin/hooks/useAdmin';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

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
    <Screen safeArea>
      <BackButton title="League Management" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={isFocused && (isLoading || isRefetching)} onRefresh={onRefresh} />}
      >
        {error ? (
          <Text className="text-error text-base">Unable to load leagues. Pull to refresh to try again.</Text>
        ) : (
          <Text className="text-text text-sm mb-4">Showing {data?.length ?? 0} leagues.</Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((league) => (
            <Card key={league.id}>
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 mr-4">
                  <Text className="text-text text-lg font-semibold">{league.name}</Text>
                  <Text className="text-text/70 text-sm">{league.id}</Text>
                </View>
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide text-right">Join Code</Text>
                  <Text className="text-text text-base font-semibold">{league.join_code}</Text>
                </View>
              </View>

              <View className="flex-row mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Owner</Text>
                  <Text className="text-text text-sm">{league.owner?.full_name ?? 'Unknown owner'}</Text>
                  <Text className="text-text/70 text-xs">{league.owner?.email ?? 'No email on file'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Competition</Text>
                  <Text className="text-text text-sm">{league.competition?.name ?? 'Not assigned'}</Text>
                  <Text className="text-text/70 text-xs">{league.competition?.area ?? ''}</Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Max Members</Text>
                  <Text className="text-text text-sm">{league.max_members}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">Created</Text>
                  <Text className="text-text text-sm">{new Date(league.created_at).toLocaleString()}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default AdminLeaguesScreen;
