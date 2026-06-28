import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { useGetTodayMatches } from '@/features/matches/hooks/useMatches';
import { mapMatchToCardProps } from '@/features/matches/utils/matchCard.mapper';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { usePaywall } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { leagueApi } from '../api/leagueApi';
import LeaguesLimitActivation from '../components/leagues-limit-activation';
import MyLeagueCard from '../components/MyLeagueCard';
import TodayMatches from '../components/today-matches';
import { useMyLeagues, useUpdateLeagueActivation, useUpdatePrimaryLeague } from '../hooks/useLeagues';
import { MyLeagueType } from '../types';

// --- Sub-components ---

const sortLeaguesByActive = (leagues: MyLeagueType[]) =>
  [...leagues].sort((a, b) => Number(b.active) - Number(a.active));

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
  totalLeaguesCount: number;
  maxLeagues: number;
  reachedLimit: boolean;
  usagePercent: number;
  paddingBottom: number;
};

function LeaguesUsageCard({
  leaguesCount,
  totalLeaguesCount,
  maxLeagues,
  reachedLimit,
  usagePercent,
  paddingBottom,
}: LeaguesUsageCardProps) {
  const { t } = useTranslation();

  return (
    <View style={{ paddingBottom: paddingBottom + 16 }}>
      <View className=" rounded-2xl border border-border bg-surface p-4">
        <View className="flex-row justify-between items-center mb-2">
          <CText variant="body" bold>
            {t('Active leagues')}
          </CText>
          <CText variant="body" bold className={reachedLimit ? 'text-yellow-500 font-bold' : 'text-muted'}>
            {leaguesCount}/{maxLeagues}
          </CText>
        </View>
        {totalLeaguesCount !== leaguesCount && (
          <CText variant="caption" className="mb-2 text-muted">
            {t('{{count}} inactive leagues kept in your account', {
              count: String(totalLeaguesCount - leaguesCount),
            })}
          </CText>
        )}
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
  onSelectLeague: (leagueId: string, isPrimary: boolean) => void;
};

function LeaguesList({ leagues, onSelectLeague }: LeaguesListProps) {
  const { t } = useTranslation();

  const sortedLeagues = useMemo(() => sortLeaguesByActive(leagues), [leagues]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-3 px-2 mt-4 flex-1"
    >
      {leagues.length === 0 ? (
        <View className="pt-10 items-center w-full">
          <CText variant="bodyBold" className="text-center text-muted">
            {t('Create or join a league to get started.')}
          </CText>
        </View>
      ) : (
        sortedLeagues.map((league) => (
          <View key={league.league.id} className="w-[180px]">
            <MyLeagueCard item={league} onPress={() => onSelectLeague(league.league.id, league.is_primary)} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

// --- Screen ---

const MyLeagues = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const activeMember = useMemberStore((s) => s.activeMember);
  const setActiveMember = useMemberStore((s) => s.setActiveMember);

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const openPaywall = usePaywall();

  const { data: leagues, isPending, isFetching, error, refetch } = useMyLeagues();
  const { isPro, leaguesCount, totalLeaguesCount, maxLeagues, reachedLimit, exceededLimit, usagePercent } =
    useSubscriptionLimits();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { mutateAsync: updateLeagueActivation, isPending: isUpdatingLeagueActivation } = useUpdateLeagueActivation();

  const sortedLeagues = useMemo(() => sortLeaguesByActive(leagues ?? []), [leagues]);
  const primaryLeague = leagues?.find((l) => l.is_primary);

  const { data: matches, isPending: isLoadingMatches } = useGetTodayMatches({
    competitionId: primaryLeague?.league?.competition?.id ?? null,
    memberId: primaryLeague?.id ?? null,
  });
  const matchesList = useMemo(() => matches?.map(mapMatchToCardProps) ?? [], [matches]);

  const [selectedActiveMemberIds, setSelectedActiveMemberIds] = useState<string[]>([]);

  const requiresLeagueActivation = !isPro && exceededLimit;

  const isLoading = !!userId && (isPending || isFetching);

  useEffect(() => {
    if (!requiresLeagueActivation) return;

    setSelectedActiveMemberIds((current) => {
      const validCurrent = current.filter((memberId) => leagues?.some((league) => league.id === memberId));
      if (validCurrent.length > 0) return validCurrent;
      return [];
    });
  }, [leagues, requiresLeagueActivation]);

  const handleToggleLeagueActivation = (memberId: string) => {
    setSelectedActiveMemberIds((current) => {
      if (current.includes(memberId)) {
        return current.filter((selectedMemberId) => selectedMemberId !== memberId);
      }

      if (current.length >= maxLeagues) return current;

      return [...current, memberId];
    });
  };

  const handleSaveLeagueActivation = async () => {
    if (selectedActiveMemberIds.length > maxLeagues) return;
    await updateLeagueActivation(selectedActiveMemberIds);
    await refetch();
  };

  const handleSelectLeague = async (leagueId: string, isPrimary: boolean) => {
    if (requiresLeagueActivation) return;

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <LeagueActionsHeader reachedLimit={reachedLimit} isPro={isPro} onUpgrade={openPaywall} />
        <LeaguesList leagues={leagues ?? []} onSelectLeague={handleSelectLeague} />
        <TodayMatches matches={matchesList} isLoadingMatches={isLoadingMatches} />
      </ScrollView>
      <LeaguesUsageCard
        leaguesCount={leaguesCount}
        totalLeaguesCount={totalLeaguesCount}
        maxLeagues={maxLeagues}
        reachedLimit={reachedLimit}
        usagePercent={usagePercent}
        paddingBottom={insets.bottom}
      />
      {requiresLeagueActivation && (
        <LeaguesLimitActivation
          leagues={sortedLeagues}
          maxLeagues={maxLeagues}
          selectedMemberIds={selectedActiveMemberIds}
          isSaving={isUpdatingLeagueActivation}
          onToggleLeague={handleToggleLeagueActivation}
          onSave={handleSaveLeagueActivation}
          onUpgrade={openPaywall}
        />
      )}
    </Screen>
  );
};

export default MyLeagues;
