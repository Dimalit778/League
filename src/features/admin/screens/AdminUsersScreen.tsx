import { Button, Card, LoadingOverlay, Screen, Text } from '@/components';
import {
  AdminCollectionSummary,
  AdminEmpty,
  AdminErrorBanner,
  AdminMeta,
  AdminPageHeader,
  AdminSearchField,
} from '@/features/admin/components/AdminUI';
import { ADMIN_CONTENT_CLASS, formatAdminDate } from '@/features/admin/lib/adminUi';
import { useAdminUsersInfinite, useDeleteUser } from '@/features/admin/hooks/useAdmin';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import type { Tables } from '@/types/database.types';
import { SearchX, Trash2, UserRound } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type ListRenderItemInfo,
  useWindowDimensions,
  View,
} from 'react-native';

type AdminUser = Tables<'users'>;

type AdminUserRowProps = {
  id: string;
  fullName: string | null;
  email: string | null;
  createdAt: string | null;
  isDeleting: boolean;
  onDelete: (userId: string, userName: string) => void;
};

const AdminUserRow = memo(function AdminUserRow({
  id,
  fullName,
  email,
  createdAt,
  isDeleting,
  onDelete,
}: AdminUserRowProps) {
  const { t, language } = useTranslation();
  const { colors } = useThemeTokens();
  const displayName = fullName || email || t('Unnamed User');
  const initials = displayName.slice(0, 1).toUpperCase();

  const handlePress = useCallback(() => onDelete(id, displayName), [displayName, id, onDelete]);

  return (
    <Card className="h-full" contentClassName="min-h-[154px] gap-4">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-subtle">
          <Text variant="subtitle" tone="primary">
            {initials}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text variant="subtitle" numberOfLines={1}>
            {displayName}
          </Text>
          <Text variant="bodySmall" tone="muted" ltr numberOfLines={1}>
            {email || t('No email')}
          </Text>
        </View>
        <Button
          onPress={handlePress}
          disabled={isDeleting}
          loading={isDeleting}
          accessibilityLabel={t('Delete user')}
          variant="outline"
          size="icon"
          className="border-error/30"
        >
          <Trash2 size={18} color={colors.error} />
        </Button>
      </View>
      <View className="mt-auto flex-row gap-4 border-t border-border pt-3">
        <AdminMeta label={t('Created')} value={formatAdminDate(createdAt, language)} className="flex-1" />
        <AdminMeta label={t('User ID')} value={`${id.slice(0, 8)}…`} ltr className="flex-1" />
      </View>
    </Card>
  );
});

const keyExtractor = (user: AdminUser) => user.id;

const AdminUsersScreen = () => {
  const usersQuery = useAdminUsersInfinite();
  const deleteUserMutation = useDeleteUser();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = useMemo(() => usersQuery.data?.pages.flat() || [], [usersQuery.data]);
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allUsers;
    return allUsers.filter((user) =>
      `${user.full_name ?? ''} ${user.email ?? ''}`.toLowerCase().includes(query),
    );
  }, [allUsers, searchQuery]);

  const loadMore = useCallback(() => {
    if (!searchQuery && usersQuery.hasNextPage && !usersQuery.isFetchingNextPage) {
      void usersQuery.fetchNextPage();
    }
  }, [searchQuery, usersQuery]);

  const handleDeleteUser = useCallback(
    (userId: string, userName: string) => {
      Alert.alert(
        t('Delete User'),
        t('Are you sure you want to delete {{name}}? This action cannot be undone.', { name: userName }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Delete'),
            style: 'destructive',
            onPress: () =>
              deleteUserMutation.mutate(userId, {
                onSuccess: () => Alert.alert(t('Success'), t('User deleted successfully')),
                onError: (error) =>
                  Alert.alert(t('Error'), t('Failed to delete user: {{message}}', { message: error.message })),
              }),
          },
        ],
      );
    },
    [deleteUserMutation, t],
  );

  const renderUser = useCallback(
    ({ item: user }: ListRenderItemInfo<AdminUser>) => (
      <View className="flex-1 p-1.5">
        <AdminUserRow
          id={user.id}
          fullName={user.full_name}
          email={user.email}
          createdAt={user.created_at}
          isDeleting={deleteUserMutation.isPending && deleteUserMutation.variables === user.id}
          onDelete={handleDeleteUser}
        />
      </View>
    ),
    [deleteUserMutation.isPending, deleteUserMutation.variables, handleDeleteUser],
  );

  if (usersQuery.isLoading && !usersQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={['bottom']}>
      <FlatList
        key={`users-${numColumns}`}
        data={filteredUsers}
        numColumns={numColumns}
        keyExtractor={keyExtractor}
        renderItem={renderUser}
        refreshing={usersQuery.isRefetching}
        onRefresh={() => void usersQuery.refetch()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.45}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={ADMIN_CONTENT_CLASS}
        ListHeaderComponent={
          <View>
            <AdminPageHeader
              eyebrow={t('People')}
              title={t('User Management')}
              description={t('Search accounts, review key details, and manage access safely.')}
            />
            <AdminSearchField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('Search by name or email...')}
            />
            <View className="mt-3">
              <AdminCollectionSummary
                countLabel={t('{{count}} users found', { count: filteredUsers.length })}
                badgeLabel={searchQuery ? t('Filtered') : undefined}
              />
            </View>
            {usersQuery.error ? <AdminErrorBanner message={usersQuery.error.message} /> : null}
          </View>
        }
        ListFooterComponent={
          usersQuery.isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator size="small" />
              <Text variant="caption" tone="muted" className="mt-2">
                {t('Loading more users...')}
              </Text>
            </View>
          ) : (
            <View className="h-8" />
          )
        }
        ListEmptyComponent={
          <AdminEmpty
            icon={searchQuery ? SearchX : UserRound}
            title={searchQuery ? t('No users found matching your search') : t('No users found')}
            description={searchQuery ? t('Try a different name or email address.') : undefined}
          />
        }
      />
    </Screen>
  );
};

export default AdminUsersScreen;
