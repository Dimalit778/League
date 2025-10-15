import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { useAdminLeagueMembers } from '@/hooks/useAdmin';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminLeagueMembers = () => {
  const { data, isLoading, isRefetching, refetch, error } =
    useAdminLeagueMembers();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="League Members" />
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
            Unable to load league members. Pull to refresh to try again.
          </Text>
        ) : (
          <Text className="text-text text-sm mb-4">
            Showing {data?.length ?? 0} league members.
          </Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((member) => (
            <View
              key={member.id}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-text text-lg font-semibold">
                    {member.nickname}
                  </Text>
                  <Text className="text-text/70 text-sm">
                    {member.user?.full_name ?? 'Unknown User'}
                  </Text>
                  <Text className="text-text/50 text-xs">
                    {member.user?.email ?? 'No email available'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Primary
                  </Text>
                  <Text className="text-text text-sm">
                    {member.is_primary ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    League
                  </Text>
                  <Text className="text-text text-sm">
                    {member.league?.name ?? 'Unknown League'}
                  </Text>
                  <Text className="text-text/70 text-xs">
                    {member.league?.id}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Joined
                  </Text>
                  <Text className="text-text text-sm">
                    {new Date(member.created_at).toLocaleString()}
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

export default AdminLeagueMembers;
