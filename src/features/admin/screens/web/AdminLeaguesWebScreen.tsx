import { Badge, LoadingOverlay, Screen, Text } from '@/components';
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
import { useAdminLeagueMembers, useAdminLeagues } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function AdminLeaguesWebScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const leaguesQuery = useAdminLeagues();
  const membersQuery = useAdminLeagueMembers();
  const [searchQuery, setSearchQuery] = useState('');

  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of membersQuery.data ?? []) counts.set(member.league_id, (counts.get(member.league_id) ?? 0) + 1);
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

  if (leaguesQuery.isLoading && !leaguesQuery.data) return <LoadingOverlay />;

  return (
    <Screen edges={[]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={ADMIN_WEB_CONTENT_CLASS}>
          <AdminWebPageHeader
            eyebrow={t('Competition')}
            title={t('League Management')}
            description={t('Browse every league and open its member directory.')}
          />
          <AdminWebToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t('Search leagues, owners, or join codes...')}
            summary={t('Showing {{count}} leagues.', { count: filteredLeagues.length })}
          />

          {leaguesQuery.error || membersQuery.error ? (
            <AdminErrorBanner message={t('Unable to load leagues. Pull to refresh to try again.')} />
          ) : filteredLeagues.length === 0 ? (
            <AdminEmpty icon={Trophy} title={t('No leagues found')} />
          ) : (
            <AdminWebTable
              columns={[
                { label: t('League'), flex: 2, minWidth: 240 },
                { label: t('Competition'), flex: 1.4, minWidth: 180 },
                { label: t('Owner'), flex: 1.7, minWidth: 210 },
                { label: t('Join Code'), width: 130 },
                { label: t('Members'), width: 120 },
              ]}
              minWidth={1050}
            >
              {filteredLeagues.map((league) => (
                <AdminWebTableRow
                  key={league.id}
                  accessibilityLabel={`${league.name}. ${t('View members')}`}
                  onPress={() =>
                    router.push({ pathname: '/admin/league-members', params: { leagueId: league.id } } as never)
                  }
                >
                  <AdminWebCell flex={2} minWidth={240}>
                    <AdminWebIdentity
                      title={league.name}
                      subtitle={league.id}
                      initials={league.name.slice(0, 2).toUpperCase()}
                    />
                  </AdminWebCell>
                  <AdminWebCell flex={1.4} minWidth={180}>
                    <Text variant="body" size="sm" numberOfLines={1}>
                      {league.competition?.name ?? t('Not assigned')}
                    </Text>
                  </AdminWebCell>
                  <AdminWebCell flex={1.7} minWidth={210}>
                    <Text variant="body" size="sm" numberOfLines={1}>
                      {league.owner?.full_name ?? t('Unknown owner')}
                    </Text>
                    <Text variant="caption" tone="muted" ltr numberOfLines={1}>
                      {league.owner?.email ?? '—'}
                    </Text>
                  </AdminWebCell>
                  <AdminWebCell width={130}>
                    <Badge label={league.join_code} variant="default" />
                  </AdminWebCell>
                  <AdminWebCell width={120}>
                    <Badge label={String(memberCounts.get(league.id) ?? 0)} variant="primary" />
                  </AdminWebCell>
                </AdminWebTableRow>
              ))}
            </AdminWebTable>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
