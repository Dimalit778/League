import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { useAdminUsers } from '@/hooks/useAdmin';
import { useCallback } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

const AdminUsers = () => {
  const { data, isLoading, isRefetching, refetch, error } = useAdminUsers();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="User Management" />
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
            Unable to load users. Pull to refresh to try again.
          </Text>
        ) : (
          <Text className="text-text text-sm mb-4">
            Showing {data?.length ?? 0} users.
          </Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((user) => (
            <View
              key={user.id}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <Text className="text-text text-lg font-semibold mb-1">
                {user.full_name || 'Unnamed User'}
              </Text>
              <Text className="text-text/70 text-sm mb-4">{user.email}</Text>
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Created
                  </Text>
                  <Text className="text-text text-sm">
                    {new Date(user.created_at).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">
                    Updated
                  </Text>
                  <Text className="text-text text-sm">
                    {new Date(user.updated_at).toLocaleString()}
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

export default AdminUsers;
