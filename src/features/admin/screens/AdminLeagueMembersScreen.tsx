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
import { useAdminLeagueMembers, useAdminLeagues } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { SearchX, UsersRound } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const AdminLeagueMembersScreen = () => {
  const { t, language } = useTranslation();
  const { leagueId } = useLocalSearchParams<{ leagueId?: string }>();
  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;
  const membersQuery = useAdminLeagueMembers();
  const leaguesQuery = useAdminLeagues();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagueId ?? 'all');

  useEffect(() => {
    setSelectedLeagueId(leagueId ?? 'all');
  }, [leagueId]);

  const leagues = useMemo(
    () => [...(leaguesQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [leaguesQuery.data],
  );

  const selectedLeague = useMemo(
    () => leagues.find((league) => league.id === selectedLeagueId),
    [leagues, selectedLeagueId],
  );

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (membersQuery.data ?? []).filter((member) => {
      if (selectedLeagueId !== 'all' && member.league_id !== selectedLeagueId) return false;
      if (!query) return true;
      return [member.nickname, member.user?.full_name, member.user?.email, member.league?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [membersQuery.data, searchQuery, selectedLeagueId]);

  const refresh = async () => {
    await Promise.all([membersQuery.refetch(), leaguesQuery.refetch()]);
  };

  if ((membersQuery.isLoading && !membersQuery.data) || (leaguesQuery.isLoading && !leaguesQuery.data)) {
    return <LoadingOverlay />;
  }

  const isFiltered = Boolean(searchQuery) || selectedLeagueId !== 'all';

  return (
    <Screen edges={['bottom']}>
      <FlatList
        key={`members-${numColumns}`}
        data={filteredMembers}
        numColumns={numColumns}
        keyExtractor={(member) => member.id}
        refreshing={membersQuery.isRefetching || leaguesQuery.isRefetching}
        onRefresh={() => void refresh()}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={ADMIN_CONTENT_CLASS}
        ListHeaderComponent={
          <View>
            <AdminPageHeader
              eyebrow={t('People')}
              title={t('League Members')}
              description={t('View every participant or focus on one league.')}
            />

            <Text variant="caption" tone="muted" className="mb-2 font-semibold uppercase tracking-[0.8px]">
              {t('Filter by league')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-4 mb-4"
              contentContainerClassName="gap-2 px-4"
            >
              <LeagueFilterChip
                label={t('All leagues')}
                selected={selectedLeagueId === 'all'}
                onPress={() => setSelectedLeagueId('all')}
              />
              {leagues.map((league) => (
                <LeagueFilterChip
                  key={league.id}
                  label={league.name}
                  selected={selectedLeagueId === league.id}
                  onPress={() => setSelectedLeagueId(league.id)}
                />
              ))}
            </ScrollView>

            <AdminSearchField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('Search members, users, or leagues...')}
            />
            <View className="mt-3">
              <AdminCollectionSummary
                countLabel={
                  selectedLeague
                    ? t('Showing {{count}} members in {{league}}.', {
                        count: filteredMembers.length,
                        league: selectedLeague.name,
                      })
                    : t('Showing {{count}} league members.', { count: filteredMembers.length })
                }
                badgeLabel={isFiltered ? t('Filtered') : undefined}
              />
            </View>
            {membersQuery.error || leaguesQuery.error ? (
              <AdminErrorBanner message={t('Unable to load league members. Pull to refresh to try again.')} />
            ) : null}
          </View>
        }
        renderItem={({ item: member }) => {
          const displayName = member.nickname || member.user?.full_name || t('Unknown User');

          return (
            <View className="flex-1 p-1.5">
              <Card className="h-full" padding="sm" contentClassName="gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Text variant="bodySmall" tone="primary" className="font-bold">
                      {getInitials(displayName) || '?'}
                    </Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text variant="subtitle" numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                      {member.user?.email ?? t('No email available')}
                    </Text>
                  </View>
                  <Badge
                    label={member.is_primary ? t('Primary') : t('Member')}
                    variant={member.is_primary ? 'primary' : 'default'}
                  />
                </View>

                <View className="flex-row gap-4 rounded-xl bg-subtle px-3 py-2.5">
                  <AdminMeta
                    label={t('League')}
                    value={member.league?.name ?? t('Unknown League')}
                    className="flex-[2]"
                  />
                  <AdminMeta
                    label={t('Status')}
                    value={member.active ? t('Active') : t('Inactive')}
                    className="flex-1"
                  />
                </View>

                <Text variant="caption" tone="muted">
                  {t('Joined')}: {formatAdminDate(member.created_at, language)}
                </Text>
              </Card>
            </View>
          );
        }}
        ListEmptyComponent={
          <AdminEmpty
            icon={searchQuery ? SearchX : UsersRound}
            title={
              searchQuery
                ? t('No members match your search')
                : selectedLeague
                  ? t('No members in this league')
                  : t('No league members found')
            }
            description={searchQuery ? t('Try a nickname, email, or league name.') : undefined}
          />
        }
        ListFooterComponent={<View className="h-8" />}
      />
    </Screen>
  );
};

function LeagueFilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'min-h-11 justify-center rounded-full border px-4 active:opacity-80',
        selected ? 'border-primary bg-primary' : 'border-border bg-surface',
      )}
    >
      <Text variant="bodySmall" className={cn('font-semibold', selected && 'text-primary-foreground')}>
        {label}
      </Text>
    </Pressable>
  );
}

export default AdminLeagueMembersScreen;
