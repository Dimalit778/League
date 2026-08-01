import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Card, Text } from '@/components/ui';
import { useAdminLeagueMembers } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

const AdminLeagueMembersScreen = () => {
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { data, isLoading, isRefetching, refetch, error } = useAdminLeagueMembers();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingOverlay />;
  }

  return (
    <Screen safeArea>
      <BackButton title={t('League Members')} />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={isFocused && (isLoading || isRefetching)} onRefresh={onRefresh} />}
      >
        {error ? (
          <Text className="text-error text-base">{t('Unable to load league members. Pull to refresh to try again.')}</Text>
        ) : (
          <Text className="text-text text-sm mb-4">{t('Showing {{count}} league members.', { count: data?.length ?? 0 })}</Text>
        )}

        <View className="space-y-4 pb-16">
          {data?.map((member) => (
            <Card key={member.id}>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-text text-lg font-semibold">{member.nickname}</Text>
                  <Text className="text-text/70 text-sm">{member.user?.full_name ?? 'Unknown User'}</Text>
                  <Text className="text-text/50 text-xs">{member.user?.email ?? 'No email available'}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">{t('Primary')}</Text>
                  <Text className="text-text text-sm">{member.is_primary ? t('Yes') : t('No')}</Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">{t('League')}</Text>
                  <Text className="text-text text-sm">{member.league?.name ?? 'Unknown League'}</Text>
                  <Text className="text-text/70 text-xs">{member.league?.id}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-text/50 text-xs uppercase tracking-wide">{t('Joined')}</Text>
                  <Text className="text-text text-sm">{new Date(member.created_at).toLocaleString()}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default AdminLeagueMembersScreen;
