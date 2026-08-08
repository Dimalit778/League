import { AvatarImage, Button, EmptyState, Error, ListItem, LoadingOverlay, Screen, Text } from '@/components';
import { useBlockedUsers, useUnblockUser } from '@/features/moderation/hooks/useModeration';
import { useTranslation } from '@/hooks/useTranslation';
import { Alert, View } from 'react-native';

export default function BlockedUsersScreen() {
  const { t } = useTranslation();
  const blockedUsers = useBlockedUsers();
  const unblockUser = useUnblockUser();

  if (blockedUsers.isLoading && !blockedUsers.data) return <LoadingOverlay />;
  if (blockedUsers.error) return <Error error={blockedUsers.error} />;
  if (blockedUsers.data?.length === 0) return <EmptyState variant="empty" title={t('You have not blocked anyone')} />;

  return (
    <Screen scroll padding="all" bottomInset contentClassName="gap-4" contentContainerStyle={{ flexGrow: 1 }}>
      <Text variant="bodySmall" tone="muted">
        {t('Blocked users and their content are hidden from your leagues.')}
      </Text>

      <View className="overflow-hidden rounded-xl border border-border bg-surface px-3">
        {blockedUsers.data?.map((entry, index) => {
          const name = entry.display_name || t('Unknown User');
          const isLast = index === (blockedUsers.data?.length ?? 0) - 1;

          return (
            <ListItem
              key={entry.id}
              title={name}
              leading={
                <View className="h-10 w-10 overflow-hidden rounded-full">
                  <AvatarImage nickname={name} path={entry.avatar_url} />
                </View>
              }
              trailing={
                <Button
                  label={t('Unblock')}
                  variant="outline"
                  size="sm"
                  loading={unblockUser.isPending && unblockUser.variables === entry.blocked_user_id}
                  disabled={unblockUser.isPending}
                  onPress={() =>
                    unblockUser.mutate(entry.blocked_user_id, {
                      onError: (error) => Alert.alert(t('Error'), error.message),
                    })
                  }
                />
              }
              divider={!isLast}
            />
          );
        })}
      </View>
    </Screen>
  );
}
