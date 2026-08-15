import { Badge, Card, LoadingOverlay, Screen, Text } from '@/components';
import {
  ADMIN_CONTENT_CLASS,
  AdminCollectionSummary,
  AdminEmpty,
  AdminErrorBanner,
  AdminMeta,
  AdminPageHeader,
  AdminSearchField,
} from '@/features/admin/components/AdminUI';
import { useAdminLeagueMembers, useAdminLeagues } from '@/features/admin/hooks/useAdmin';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronLeft, ChevronRight, SearchX, Trophy, UsersRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';

const AdminLeaguesScreen = () => {
  const { t, isRTL } = useTranslation();
  const { colors } = useThemeTokens();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;
  const leaguesQuery = useAdminLeagues();
  const membersQuery = useAdminLeagueMembers();
  const [searchQuery, setSearchQuery] = useState('');

  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of membersQuery.data ?? []) {
      counts.set(member.league_id, (counts.get(member.league_id) ?? 0) + 1);
    }
    return counts;
  }, [membersQuery.data]);

  const filteredLeagues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const leagues = leaguesQuery.data ?? [];
    if (!query) return leagues;
    return leagues.filter((league) =>
      [league.name, league.join_code, league.owner?.full_name, league.owner?.email, league.competition?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [leaguesQuery.data, searchQuery]);

  const openLeagueMembers = (leagueId: string) => {
    router.push({
      pathname: '/admin/league-members',
      params: { leagueId },
    });
  };

  const refresh = async () => {
    await Promise.all([leaguesQuery.refetch(), membersQuery.refetch()]);
  };

  if (leaguesQuery.isLoading && !leaguesQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={['bottom']}>
      <FlatList
        key={`leagues-${numColumns}`}
        data={filteredLeagues}
        numColumns={numColumns}
        keyExtractor={(league) => league.id}
        refreshing={leaguesQuery.isRefetching || membersQuery.isRefetching}
        onRefresh={() => void refresh()}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={ADMIN_CONTENT_CLASS}
        ListHeaderComponent={
          <View>
            <AdminPageHeader
              eyebrow={t('Competition')}
              title={t('League Management')}
              description={t('Browse every league and open its member directory.')}
            />
            <AdminSearchField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('Search leagues, owners, or join codes...')}
            />
            <View className="mt-3">
              <AdminCollectionSummary
                countLabel={t('Showing {{count}} leagues.', { count: filteredLeagues.length })}
                badgeLabel={searchQuery ? t('Filtered') : undefined}
              />
            </View>
            {leaguesQuery.error ? (
              <AdminErrorBanner message={t('Unable to load leagues. Pull to refresh to try again.')} />
            ) : null}
          </View>
        }
        renderItem={({ item: league }) => {
          const membersCount = memberCounts.get(league.id) ?? 0;
          const Chevron = isRTL ? ChevronLeft : ChevronRight;

          return (
            <View className="flex-1 p-1.5">
              <Card
                className="h-full"
                padding="sm"
                onPress={() => openLeagueMembers(league.id)}
                accessibilityLabel={`${league.name}. ${t('{{count}} members', { count: membersCount })}`}
                contentClassName="gap-3"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <Trophy size={21} color={colors.primary} strokeWidth={1.9} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text variant="subtitle" numberOfLines={1}>
                      {league.name}
                    </Text>
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {league.competition?.name ?? t('Not assigned')}
                    </Text>
                  </View>
                  <Badge
                    label={t('{{count}} members', { count: membersCount })}
                    variant="primary"
                    leftIcon={<UsersRound size={14} color={colors.primary} strokeWidth={2} />}
                  />
                </View>

                <View className="flex-row gap-4 rounded-xl bg-subtle px-3 py-2.5">
                  <AdminMeta
                    label={t('Owner')}
                    value={league.owner?.full_name ?? t('Unknown owner')}
                    className="flex-1"
                  />
                  <AdminMeta label={t('Join Code')} value={league.join_code} ltr className="flex-1" />
                </View>

                <View className="flex-row items-center justify-between border-t border-border pt-3">
                  <Text variant="bodySmall" tone="primary" className="font-semibold">
                    {t('View members')}
                  </Text>
                  <Chevron size={18} color={colors.primary} strokeWidth={2.1} />
                </View>
              </Card>
            </View>
          );
        }}
        ListEmptyComponent={
          <AdminEmpty
            icon={searchQuery ? SearchX : Trophy}
            title={searchQuery ? t('No leagues match your search') : t('No leagues found')}
            description={searchQuery ? t('Try a league name, owner, or join code.') : undefined}
          />
        }
        ListFooterComponent={<View className="h-8" />}
      />
    </Screen>
  );
};

export default AdminLeaguesScreen;
