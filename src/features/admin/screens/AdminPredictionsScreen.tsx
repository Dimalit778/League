import { Badge, Card, LoadingOverlay, Screen, Text } from '@/components';
import {
  ADMIN_CONTENT_CLASS,
  AdminCollectionSummary,
  AdminEmpty,
  AdminErrorBanner,
  AdminMeta,
  AdminPageHeader,
  AdminSearchField,
  formatAdminDate,
} from '@/features/admin/components/AdminUI';
import { useAdminPredictions } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchX, Target } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';

const AdminPredictionsScreen = () => {
  const { t, language } = useTranslation();
  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;
  const predictionsQuery = useAdminPredictions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPredictions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const predictions = predictionsQuery.data ?? [];
    if (!query) return predictions;
    return predictions.filter((prediction) =>
      [
        prediction.league?.name,
        prediction.member?.nickname,
        prediction.user?.full_name,
        prediction.user?.email,
        String(prediction.match_id),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [predictionsQuery.data, searchQuery]);

  if (predictionsQuery.isLoading && !predictionsQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={['bottom']}>
      <FlatList
        key={`predictions-${numColumns}`}
        data={filteredPredictions}
        numColumns={numColumns}
        keyExtractor={(prediction) => prediction.id}
        refreshing={predictionsQuery.isRefetching}
        onRefresh={() => void predictionsQuery.refetch()}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={ADMIN_CONTENT_CLASS}
        ListHeaderComponent={
          <View>
            <AdminPageHeader
              eyebrow={t('Activity')}
              title={t('Predictions')}
              description={t('Audit the latest prediction activity across users and leagues.')}
            />
            <AdminSearchField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('Search predictions by user, league, or fixture...')}
            />
            <View className="mt-3">
              <AdminCollectionSummary
                countLabel={t('Showing {{count}} recent predictions (latest 200 records).', {
                  count: filteredPredictions.length,
                })}
                badgeLabel={searchQuery ? t('Filtered') : t('Latest 200')}
              />
            </View>
            {predictionsQuery.error ? (
              <AdminErrorBanner message={t('Unable to load predictions. Pull to refresh to try again.')} />
            ) : null}
          </View>
        }
        renderItem={({ item: prediction }) => (
          <View className="flex-1 p-1.5">
            <Card className="h-full" contentClassName="min-h-[215px] gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text variant="subtitle" numberOfLines={1}>
                    {prediction.league?.name ?? t('Unknown League')}
                  </Text>
                  <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                    {prediction.member?.nickname ?? t('Unknown member')}
                  </Text>
                  <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                    {prediction.user?.email ?? t('No email')}
                  </Text>
                </View>
                <Badge
                  label={prediction.is_finished ? t('Finished') : t('Pending')}
                  variant={prediction.is_finished ? 'success' : 'warning'}
                />
              </View>

              <View className="flex-row items-center justify-between rounded-2xl bg-subtle p-3">
                <AdminMeta label={t('Predicted Score')} value={`${prediction.home_score} – ${prediction.away_score}`} />
                <View className="items-end">
                  <Text variant="caption" tone="muted">
                    {t('Points')}
                  </Text>
                  <Text variant="title" tone={prediction.points ? 'success' : 'default'}>
                    {prediction.points ?? 0}
                  </Text>
                </View>
              </View>

              <View className="mt-auto flex-row gap-4 border-t border-border pt-3">
                <AdminMeta label={t('Fixture ID')} value={prediction.match_id} ltr className="flex-1" />
                <AdminMeta
                  label={t('Submitted')}
                  value={formatAdminDate(prediction.created_at, language)}
                  className="flex-[2]"
                />
              </View>
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <AdminEmpty
            icon={searchQuery ? SearchX : Target}
            title={searchQuery ? t('No predictions match your search') : t('No predictions found')}
            description={searchQuery ? t('Try a user, league, or fixture ID.') : undefined}
          />
        }
        ListFooterComponent={<View className="h-8" />}
      />
    </Screen>
  );
};

export default AdminPredictionsScreen;
