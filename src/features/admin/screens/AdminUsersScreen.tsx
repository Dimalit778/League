import { BackButton, Button, Card, LoadingOverlay, Screen, Text } from '@/components';
import { useAdminUsersInfinite, useDeleteUser } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import type { Tables } from '@/types/database.types';
import TrashIcon from '@assets/icons/TrashIcon';
import { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, type ListRenderItemInfo, TextInput, View } from 'react-native';

type AdminUser = Tables<'users'>;

type AdminUserRowProps = {
  id: string;
  fullName: string | null;
  email: string | null;
  isDeleting: boolean;
  onDelete: (userId: string, userName: string) => void;
};

const AdminUserRow = memo(function AdminUserRow({ id, fullName, email, isDeleting, onDelete }: AdminUserRowProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => {
    onDelete(id, fullName || email || t('this user'));
  }, [email, fullName, id, onDelete, t]);

  return (
    <Card className="my-2">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-text text-lg font-semibold mb-1">{fullName || t('Unnamed User')}</Text>
          <Text className="text-muted text-sm mb-4">{email}</Text>
        </View>
        <Button
          onPress={handlePress}
          disabled={isDeleting}
          accessibilityLabel={t('Delete user')}
          variant="secondary"
          size="icon"
        >
          <TrashIcon size={20} color="#ef4444" />
        </Button>
      </View>
    </Card>
  );
});

const keyExtractor = (user: AdminUser) => user.id;

const AdminUsersScreen = () => {
  const { data, isLoading, isRefetching, refetch, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAdminUsersInfinite();
  const { isPending: isDeleting, mutate: deleteUser } = useDeleteUser();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(() => {
    void refetch();
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
      Alert.alert(t('Delete User'), t('Are you sure you want to delete {{name}}? This action cannot be undone.', { name: userName }), [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => {
            deleteUser(userId, {
              onSuccess: () => {
                Alert.alert(t('Success'), t('User deleted successfully'));
              },
              onError: (error) => {
                Alert.alert(t('Error'), t('Failed to delete user: {{message}}', { message: error.message }));
              },
            });
          },
        },
      ]);
    },
    [deleteUser, t],
  );

  const renderUser = useCallback(
    ({ item: user }: ListRenderItemInfo<AdminUser>) => (
      <AdminUserRow
        id={user.id}
        fullName={user.full_name}
        email={user.email}
        isDeleting={isDeleting}
        onDelete={handleDeleteUser}
      />
    ),
    [handleDeleteUser, isDeleting],
  );

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  if (error && !data) {
    return (
      <Screen safeArea padding="all" contentClassName="items-center justify-center">
        <Text className="text-center text-error">{error.message}</Text>
      </Screen>
    );
  }

  return (
    <Screen safeArea>
      <BackButton title={t('User Management')} />
      <View className="px-4 mb-4">
        <TextInput
          placeholder={t('Search by name or email...')}
          placeholderTextColor="#aaa"
          className="bg-surface text-text border border-border rounded-lg px-4 py-3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {filteredUsers.length > 0 && (
          <Text className="text-muted text-sm mt-2">
            {t('{{count}} users found', { count: filteredUsers.length })}
          </Text>
        )}
      </View>
      <FlatList
        data={filteredUsers}
        refreshing={isRefetching}
        onRefresh={onRefresh}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onEndReached={searchQuery ? undefined : loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#666" size="small" />
              <Text className="text-muted text-sm mt-2">{t('Loading more users...')}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-muted text-center">
              {searchQuery ? t('No users found matching your search') : t('No users found')}
            </Text>
          </View>
        }
        renderItem={renderUser}
      />
    </Screen>
  );
};

export default AdminUsersScreen;
