import { LoadingOverlay } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { useAdminUsersInfinite, useDeleteUser } from '@/hooks/useAdmin';
import TrashIcon from '@assets/icons/TrashIcon';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminUsers = () => {
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminUsersInfinite();
  const deleteUserMutation = useDeleteUser();
  const [refetching, setRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(() => {
    refetch().finally(() => {
      setRefetching(false);
    });
    setRefetching(true);
  }, [refetch]);

  // Flatten all pages into a single array
  const allUsers = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const filteredUsers = useMemo(() => {
    if (!allUsers.length) return [];
    if (!searchQuery.trim()) return allUsers;

    const query = searchQuery.toLowerCase().trim();
    return allUsers.filter((user) => {
      const fullName = user.full_name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      return fullName.includes(query) || email.includes(query);
    });
  }, [allUsers, searchQuery]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDeleteUser = useCallback(
    (userId: string, userName: string) => {
      Alert.alert(
        'Delete User',
        `Are you sure you want to delete ${userName}? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteUserMutation.mutate(userId, {
                onSuccess: () => {
                  Alert.alert('Success', 'User deleted successfully');
                },
                onError: (error) => {
                  Alert.alert(
                    'Error',
                    `Failed to delete user: ${error.message}`
                  );
                },
              });
            },
          },
        ]
      );
    },
    [deleteUserMutation]
  );

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="User Management" />
      <View className="px-4 mb-4">
        <TextInput
          placeholder="Search by name or email..."
          placeholderTextColor="#aaa"
          className="bg-surface text-text border border-border rounded-lg px-4 py-3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {filteredUsers.length > 0 && (
          <Text className="text-muted text-sm mt-2">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}{' '}
            found
          </Text>
        )}
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onEndReached={searchQuery ? undefined : loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#666" size="small" />
              <Text className="text-muted text-sm mt-2">
                Loading more users...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-muted text-center">
              {searchQuery
                ? 'No users found matching your search'
                : 'No users found'}
            </Text>
          </View>
        }
        renderItem={({ item: user }) => (
          <View className="bg-surface border border-border rounded-2xl p-4 my-2">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-text text-lg font-semibold mb-1">
                  {user.full_name || 'Unnamed User'}
                </Text>
                <Text className="text-muted text-sm mb-4">{user.email}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleDeleteUser(
                    user.id,
                    user.full_name || user.email || 'this user'
                  )
                }
                disabled={deleteUserMutation.isPending}
                className="p-2 bg-red-500/10 rounded-lg"
              >
                <TrashIcon size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default AdminUsers;
