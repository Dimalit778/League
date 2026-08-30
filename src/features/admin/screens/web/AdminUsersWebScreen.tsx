import { Badge, Button, LoadingOverlay, Screen, Text } from '@/components';
import {
  ADMIN_WEB_CONTENT_CLASS,
  AdminWebCell,
  AdminWebIdentity,
  AdminWebPageHeader,
  AdminWebTable,
  AdminWebTableRow,
  AdminWebToolbar,
} from '@/features/admin/components/AdminWebUI';
import { AdminEmpty, AdminErrorBanner } from '@/features/admin/components/AdminUI';
import { adminUserDisplayName, filterAdminUsers, formatAdminDate } from '@/features/admin/lib/adminUi';
import { useAdminUsersInfinite, useDeleteUser } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchX, Trash2, UserRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function AdminUsersWebScreen() {
  const { t, language } = useTranslation();
  const usersQuery = useAdminUsersInfinite();
  const deleteUser = useDeleteUser();
  const [searchQuery, setSearchQuery] = useState('');

  const users = useMemo(() => usersQuery.data?.pages.flat() ?? [], [usersQuery.data]);
  const filteredUsers = useMemo(() => filterAdminUsers(users, searchQuery), [searchQuery, users]);

  const confirmDelete = (id: string, displayName: string) => {
    if (!globalThis.confirm(t('Are you sure you want to delete {{name}}? This action cannot be undone.', { name: displayName }))) {
      return;
    }
    deleteUser.mutate(id);
  };

  if (usersQuery.isLoading && !usersQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={[]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={ADMIN_WEB_CONTENT_CLASS}>
          <AdminWebPageHeader
            eyebrow={t('People')}
            title={t('User Management')}
            description={t('Search accounts, review key details, and manage access safely.')}
          />
          <AdminWebToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t('Search by name or email...')}
            summary={t('{{count}} users found', { count: filteredUsers.length })}
          />

          {usersQuery.error ? <AdminErrorBanner message={usersQuery.error.message} /> : null}
          {filteredUsers.length === 0 ? (
            <AdminEmpty
              icon={searchQuery ? SearchX : UserRound}
              title={searchQuery ? t('No users found matching your search') : t('No users found')}
              description={searchQuery ? t('Try a different name or email address.') : undefined}
            />
          ) : (
            <AdminWebTable
              columns={[
                { label: t('Name'), flex: 2, minWidth: 220 },
                { label: t('Status'), width: 120 },
                { label: t('Created'), flex: 1.25, minWidth: 170 },
                { label: t('User ID'), flex: 1.25, minWidth: 170 },
                { label: t('Actions'), width: 92 },
              ]}
              minWidth={980}
            >
              {filteredUsers.map((user) => {
                const displayName = adminUserDisplayName(user, t('Unnamed User'));
                return (
                  <AdminWebTableRow key={user.id}>
                    <AdminWebCell flex={2} minWidth={220}>
                      <AdminWebIdentity
                        title={displayName}
                        subtitle={user.email}
                        initials={displayName.slice(0, 2).toUpperCase()}
                      />
                    </AdminWebCell>
                    <AdminWebCell width={120}>
                      <Badge label={t('Active')} variant="success" />
                    </AdminWebCell>
                    <AdminWebCell flex={1.25} minWidth={170}>
                      <Text variant="body" size="sm">{formatAdminDate(user.created_at, language)}</Text>
                    </AdminWebCell>
                    <AdminWebCell flex={1.25} minWidth={170}>
                      <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                        {user.id}
                      </Text>
                    </AdminWebCell>
                    <AdminWebCell width={92} className="items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        accessibilityLabel={t('Delete user')}
                        disabled={deleteUser.isPending}
                        onPress={() => confirmDelete(user.id, displayName)}
                      >
                        <Trash2 size={17} />
                      </Button>
                    </AdminWebCell>
                  </AdminWebTableRow>
                );
              })}
            </AdminWebTable>
          )}

          {usersQuery.hasNextPage && !searchQuery ? (
            <View className="mt-5 items-center">
              <Button
                label={t('Load more')}
                variant="outline"
                loading={usersQuery.isFetchingNextPage}
                onPress={() => void usersQuery.fetchNextPage()}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
