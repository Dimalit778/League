import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { usePaywall } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { leagueApi } from '../api/leagueApi';
import MyLeagueCard from '../components/MyLeagueCard';
import { useMyLeagues, useUpdatePrimaryLeague } from '../hooks/useLeagues';
import { MyLeagueType } from '../types';

// --- Sub-components ---

type LeagueActionsHeaderProps = {
  reachedLimit: boolean;
  isPro: boolean;
  onUpgrade: () => void;
};

function LeagueActionsHeader({ reachedLimit, isPro, onUpgrade }: LeagueActionsHeaderProps) {
  const { t } = useTranslation();

  if (reachedLimit && !isPro) {
    return (
      <Pressable onPress={onUpgrade} className="bg-yellow-500 py-2 m-4 rounded-md">
        <CText variant="caption" bold className="text-black text-center">
          {t('Max leagues reached. Upgrade to continue.')}
        </CText>
      </Pressable>
    );
  }

  return (
    <View className="flex-row justify-between px-2">
      <Button
        title={t('Create League')}
        variant="outline"
        size="md"
        onPress={() => router.navigate('/myLeagues/select-competition')}
      />
      <Button
        title={t('Join League')}
        variant="outline"
        size="md"
        onPress={() => router.navigate('/myLeagues/join-league')}
      />
    </View>
  );
}

type LeaguesUsageCardProps = {
  leaguesCount: number;
  maxLeagues: number;
  reachedLimit: boolean;
  usagePercent: number;
  paddingBottom: number;
};

function LeaguesUsageCard({
  leaguesCount,
  maxLeagues,
  reachedLimit,
  usagePercent,
  paddingBottom,
}: LeaguesUsageCardProps) {
  return (
    <View className="mb-4" style={{ paddingBottom }}>
      <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <View className="flex-row justify-between items-center mb-2">
          <CText variant="body" bold>
            Leagues
          </CText>
          <CText variant="body" bold className={reachedLimit ? 'text-yellow-500 font-bold' : 'text-muted'}>
            {leaguesCount}/{maxLeagues}
          </CText>
        </View>
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View
            style={{ width: `${usagePercent}%` }}
            className={`h-full ${reachedLimit ? 'bg-yellow-500' : 'bg-secondary'}`}
          />
        </View>
      </View>
    </View>
  );
}

type LeaguesListProps = {
  leagues: MyLeagueType[];
  isFetching: boolean;
  onRefresh: () => void;
  onSelectLeague: (leagueId: string, isPrimary: boolean) => void;
};

function LeaguesList({ leagues, isFetching, onRefresh, onSelectLeague }: LeaguesListProps) {
  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />,
    [isFetching, onRefresh],
  );
  return (
    <ScrollView
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="flex-1 gap-3 p-2 mt-4"
    >
      {leagues.length === 0 ? (
        <View className="flex-1 pt-10">
          <CText className="text-center text-muted font-bold text-lg">Create or join a league to get started</CText>
        </View>
      ) : (
        leagues.map((league) => (
          <MyLeagueCard
            key={league.league.id}
            item={league}
            onPress={() => onSelectLeague(league.league.id, league.is_primary)}
          />
        ))
      )}
    </ScrollView>
  );
}

// --- Screen ---

const MyLeagues = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: leagues, isPending, isFetching, error, refetch } = useMyLeagues();
  const { isPro, leaguesCount, maxLeagues, reachedLimit, usagePercent } = useSubscriptionLimits();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const activeMember = useMemberStore((s) => s.activeMember);
  const setActiveMember = useMemberStore((s) => s.setActiveMember);
  const openPaywall = usePaywall();

  const isLoading = !!userId && (isPending || isFetching);

  const handleSelectLeague = async (leagueId: string, isPrimary: boolean) => {
    const selectedLeague = leagues?.find((l) => l.league.id === leagueId);
    if (!selectedLeague) return;

    if (!selectedLeague.active) {
      await openPaywall();
      return;
    }

    const previousActiveMember = activeMember;
    setActiveMember(selectedLeague);

    await queryClient.prefetchQuery({
      queryKey: KEYS.leagues.leaderboard(leagueId),
      queryFn: () => leagueApi.getLeaderboardView(leagueId),
      staleTime: 1000 * 60 * 5,
    });

    router.replace('/(app)/(member)/(tabs)/Home');

    if (isPrimary) return;

    try {
      await updatePrimaryLeague({ leagueId });
    } catch {
      setActiveMember(previousActiveMember);
      router.replace('/(app)/(public)/myLeagues');
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <Screen>
        <LoadingOverlay />
      </Screen>
    );
  }

  if (error) return <Error error={error as Error} />;

  return (
    <Screen>
      <LeagueActionsHeader reachedLimit={reachedLimit} isPro={isPro} onUpgrade={openPaywall} />
      <LeaguesList
        leagues={leagues ?? []}
        isFetching={isFetching}
        onRefresh={refetch}
        onSelectLeague={handleSelectLeague}
      />
      <LeaguesUsageCard
        leaguesCount={leaguesCount}
        maxLeagues={maxLeagues}
        reachedLimit={reachedLimit}
        usagePercent={usagePercent}
        paddingBottom={insets.bottom}
      />
    </Screen>
  );
};

export default MyLeagues;
