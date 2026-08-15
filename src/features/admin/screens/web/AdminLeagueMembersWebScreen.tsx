import { Badge, Chip, LoadingOverlay, Screen, Text } from '@/components';
import {
  ADMIN_WEB_CONTENT_CLASS,
  AdminWebCell,
  AdminWebIdentity,
  AdminWebPageHeader,
  AdminWebTable,
  AdminWebTableRow,
  AdminWebToolbar,
} from '@/features/admin/components/AdminWebUI';
import { AdminEmpty, AdminErrorBanner, formatAdminDate } from '@/features/admin/components/AdminUI';
import { useAdminLeagueMembers, useAdminLeagues } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { UsersRound } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function AdminLeagueMembersWebScreen() {
  const { t, language } = useTranslation();
  const { leagueId } = useLocalSearchParams<{ leagueId?: string }>();
  const membersQuery = useAdminLeagueMembers();
  const leaguesQuery = useAdminLeagues();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagueId ?? 'all');

  useEffect(() => setSelectedLeagueId(leagueId ?? 'all'), [leagueId]);

  const leagues = useMemo(
    () => [...(leaguesQuery.data ?? [])].sort((first, second) => first.name.localeCompare(second.name)),
    [leaguesQuery.data],
  );
  const selectedLeague = leagues.find((league) => league.id === selectedLeagueId);
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

  if ((membersQuery.isLoading && !membersQuery.data) || (leaguesQuery.isLoading && !leaguesQuery.data)) {
    return <LoadingOverlay />;
  }

  return (
    <Screen edges={[]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={ADMIN_WEB_CONTENT_CLASS}>
          <AdminWebPageHeader
            eyebrow={t('People')}
            title={t('League Members')}
            description={t('View every participant or focus on one league.')}
          />

          <View className="mb-4 rounded-2xl border border-border bg-surface p-4">
            <Text variant="caption" tone="muted" className="mb-2 font-bold uppercase tracking-[0.7px]">
              {t('Filter by league')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={t('All leagues')}
                variant={selectedLeagueId === 'all' ? 'selected' : 'default'}
                onPress={() => setSelectedLeagueId('all')}
              />
              {leagues.map((league) => (
                <Chip
                  key={league.id}
                  label={league.name}
                  variant={selectedLeagueId === league.id ? 'selected' : 'default'}
                  onPress={() => setSelectedLeagueId(league.id)}
                />
              ))}
            </View>
          </View>

          <AdminWebToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t('Search members, users, or leagues...')}
            summary={
              selectedLeague
                ? t('Showing {{count}} members in {{league}}.', {
                    count: filteredMembers.length,
                    league: selectedLeague.name,
                  })
                : t('Showing {{count}} league members.', { count: filteredMembers.length })
            }
          />

          {membersQuery.error || leaguesQuery.error ? (
            <AdminErrorBanner message={t('Unable to load league members. Pull to refresh to try again.')} />
          ) : filteredMembers.length === 0 ? (
            <AdminEmpty icon={UsersRound} title={selectedLeague ? t('No members in this league') : t('No league members found')} />
          ) : (
            <AdminWebTable
              columns={[
                { label: t('Member'), flex: 2, minWidth: 230 },
                { label: t('League'), flex: 1.6, minWidth: 190 },
                { label: t('Status'), width: 120 },
                { label: t('Primary'), width: 110 },
                { label: t('Joined'), flex: 1.4, minWidth: 180 },
              ]}
              minWidth={980}
            >
              {filteredMembers.map((member) => {
                const displayName = member.nickname || member.user?.full_name || t('Unknown User');
                return (
                  <AdminWebTableRow key={member.id}>
                    <AdminWebCell flex={2} minWidth={230}>
                      <AdminWebIdentity
                        title={displayName}
                        subtitle={member.user?.email}
                        initials={displayName.slice(0, 2).toUpperCase()}
                      />
                    </AdminWebCell>
                    <AdminWebCell flex={1.6} minWidth={190}>
                      <Text variant="bodySmall" numberOfLines={1}>
                        {member.league?.name ?? t('Unknown League')}
                      </Text>
                    </AdminWebCell>
                    <AdminWebCell width={120}>
                      <Badge label={member.active ? t('Active') : t('Inactive')} variant={member.active ? 'success' : 'default'} />
                    </AdminWebCell>
                    <AdminWebCell width={110}>
                      <Badge label={member.is_primary ? t('Primary') : '—'} variant={member.is_primary ? 'primary' : 'default'} />
                    </AdminWebCell>
                    <AdminWebCell flex={1.4} minWidth={180}>
                      <Text variant="bodySmall">{formatAdminDate(member.created_at, language)}</Text>
                    </AdminWebCell>
                  </AdminWebTableRow>
                );
              })}
            </AdminWebTable>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
