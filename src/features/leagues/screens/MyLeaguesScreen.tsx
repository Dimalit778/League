import { Error, LoadingBall, Screen } from '@/components/layout';
import { competitionApi } from '@/features/leagues/api/competitionApi';
import { leagueApi } from '@/features/leagues/api/leagueApi';
import {
  EmptyList,
  LeagueHeader,
  LeaguesIndicator,
  LeaguesList,
  LimitSelectModal,
  PrimaryLeagueCard,
} from '@/features/leagues/components/myLeagues';

import { useLeagueActivationResolution } from '@/features/leagues/hooks/useLeagueActivationResolution';
import { useMyLeagues, useUpdateLeagueActivation, useUpdatePrimaryLeague } from '@/features/leagues/hooks/useLeagues';
import { matchesApi } from '@/features/matches/api/matchesService';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { KEYS } from '@/lib/queryClient';
import { usePaywall } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';

export default function MyLeaguesScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const primaryMember = useMemberStore((s) => s.primaryMember);

  const setPrimaryMember = useMemberStore((s) => s.setPrimaryMember);
  const queryClient = useQueryClient();
  const openPaywall = usePaywall();
  const { data: myLeagues, isPending, isFetching, error, refetch } = useMyLeagues();

  const { isPro, maxLeagues, exceededLimit } = useSubscriptionLimits();

  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { mutateAsync: updateLeagueActivation, isPending: isUpdatingLeagueActivation } = useUpdateLeagueActivation();

  const allLeagues = useMemo(
    () => [
      ...(myLeagues?.primaryLeague ? [myLeagues.primaryLeague] : []),
      ...(myLeagues?.leagues ?? []),
      ...(myLeagues?.inactiveLeagues ?? []),
    ],
    [myLeagues],
  );

  const requiresLeagueActivation = !isPro && exceededLimit;

  const isLoading = !!userId && (isPending || isFetching);

  const leagueActivationResolution = useLeagueActivationResolution({
    leagues: allLeagues,
    maxLeagues,
    enabled: requiresLeagueActivation,
    updateLeagueActivation,
    refetch,
  });

  const handleSelectLeague = async (leagueId: string, isPrimary: boolean) => {
    if (requiresLeagueActivation) return;

    const selectedLeague = allLeagues.find((l) => l.league.id === leagueId);
    if (!selectedLeague) return;

    if (!selectedLeague.active) {
      if (!isPro) {
        const purchased = await openPaywall();
        if (!purchased) return;
      }

      const activeMemberIds = allLeagues
        .filter((league) => league.active || league.id === selectedLeague.id)
        .map((league) => league.id)
        .slice(0, maxLeagues);

      await updateLeagueActivation(activeMemberIds);
      await refetch();
    }

    const memberToActivate = selectedLeague.active ? selectedLeague : { ...selectedLeague, active: true };

    const previousPrimaryMember = primaryMember;
    const { league } = memberToActivate;
    const { competition } = league;
    setPrimaryMember({
      memberId: memberToActivate.id,
      userId: memberToActivate.user_id,
      isPrimary: true,
      active: true,
      nickname: memberToActivate.nickname,
      avatarUrl: memberToActivate.avatar_url,
      createdAt: memberToActivate.created_at,
      leagueId: league.id,
      leagueName: league.name,
      competitionId: competition.id,
      competitionName: competition.name,
      competitionLogo: competition.logo,
      competitionFlag: competition.flag,
      competitionArea: competition.area,
      competitionType: competition.type as 'league' | 'cup',
    });

    const competitionId = competition?.id;
    const memberId = memberToActivate.id;

    const prefetchTasks: Promise<unknown>[] = [
      queryClient.prefetchQuery({
        queryKey: KEYS.leagues.leaderboard(leagueId),
        queryFn: () => leagueApi.getLeaderboardView(leagueId),
        staleTime: 1000 * 60 * 5,
      }),
    ];

    if (competitionId && memberId) {
      prefetchTasks.push(
        (async () => {
          const meta = await queryClient.fetchQuery({
            queryKey: KEYS.competitions.matchMeta(competitionId),
            queryFn: () => competitionApi.getCompetitionsDetails(competitionId),
            staleTime: 1000 * 60 * 5,
          });

          await queryClient.prefetchQuery({
            queryKey: KEYS.matches.fixture(competitionId, meta.currentFixture, memberId),
            queryFn: () =>
              matchesApi.getMatchesByFixture({
                fixture: meta.currentFixture,
                competitionId,
                memberId,
              }),
            staleTime: 1000 * 60 * 5,
          });
        })(),
      );
    }

    await Promise.all(prefetchTasks);

    router.replace('/(app)/(league)/(tabs)');

    if (isPrimary) return;

    try {
      await updatePrimaryLeague({ leagueId });
    } catch {
      setPrimaryMember(previousPrimaryMember);
      router.replace('/(app)/(user)');
    }
  };
  const { primaryLeague, leagues, inactiveLeagues, total } = myLeagues ?? {
    primaryLeague: null,
    leagues: [],
    inactiveLeagues: [],
    total: 0,
  };

  const hasLeagues = total > 0;

  if (isAuthLoading || isLoading) {
    return <LoadingBall />;
  }

  if (error) return <Error error={error as Error} />;

  return (
    <Screen edges={['top', 'bottom']}>
      <LeagueHeader />

      {!hasLeagues ? (
        <EmptyList message="Create or join a league to get started." />
      ) : (
        <>
          {primaryLeague && <PrimaryLeagueCard />}

          <LeaguesList leagues={leagues} inactiveLeagues={inactiveLeagues} onPress={handleSelectLeague} />
        </>
      )}

      <LeaguesIndicator used={total} limit={maxLeagues} onPress={openPaywall} />

      {requiresLeagueActivation && (
        <LimitSelectModal
          leagues={allLeagues}
          maxLeagues={maxLeagues}
          selectedMemberIds={leagueActivationResolution.selectedMemberIds}
          isSaving={isUpdatingLeagueActivation}
          canSave={leagueActivationResolution.canSave}
          onToggleLeague={leagueActivationResolution.toggleLeague}
          onSave={leagueActivationResolution.save}
          onUpgrade={openPaywall}
        />
      )}
    </Screen>
  );
}
