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
import {
  useMyLeagues,
  useReactivateLeaguesAfterProUpgrade,
  useUpdateLeagueActivation,
  useUpdatePrimaryLeague,
} from '@/features/leagues/hooks/useLeagues';
import { matchesApi } from '@/features/matches/api/matchesService';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { KEYS } from '@/lib/queryClient';

import { selectPrimaryMember, useMemberStore } from '@/store/MemberStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

export default function MyLeaguesScreen() {
  const primaryMember = useMemberStore(selectPrimaryMember);
  const setPrimaryMember = useMemberStore((s) => s.setPrimaryMember);
  const queryClient = useQueryClient();
  const reactivateLeaguesAfterProUpgrade = useReactivateLeaguesAfterProUpgrade();

  const { data: myLeagues, isPending, isFetching, error, refetch } = useMyLeagues();
  const { isPro, maxLeagues } = useSubscriptionLimits();

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

  const requiresLeagueActivation = !isPro && allLeagues.filter((league) => league.active).length > maxLeagues;

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

    let memberToActivate = selectedLeague;

    if (!selectedLeague.active) {
      if (!isPro) {
        const upgraded = await reactivateLeaguesAfterProUpgrade(allLeagues);
        if (!upgraded) return;
      } else {
        const activeMemberIds = allLeagues
          .filter((league) => league.active || league.id === selectedLeague.id)
          .map((league) => league.id)
          .slice(0, maxLeagues);

        await updateLeagueActivation(activeMemberIds);
      }

      const { data: refreshedMyLeagues } = await refetch();
      const refreshedAllLeagues = [
        ...(refreshedMyLeagues?.primaryLeague ? [refreshedMyLeagues.primaryLeague] : []),
        ...(refreshedMyLeagues?.leagues ?? []),
        ...(refreshedMyLeagues?.inactiveLeagues ?? []),
      ];
      memberToActivate = refreshedAllLeagues.find((league) => league.league.id === leagueId) ?? {
        ...selectedLeague,
        active: true,
      };
    }

    if (!memberToActivate.active) {
      memberToActivate = { ...memberToActivate, active: true };
    }

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
  const activeLeagues = allLeagues.filter((league) => league.active).length;

  const handleUpgrade = useCallback(async () => {
    const upgraded = await reactivateLeaguesAfterProUpgrade(allLeagues);
    if (upgraded) {
      await refetch();
    }
  }, [allLeagues, reactivateLeaguesAfterProUpgrade, refetch]);

  if (isPending || isFetching) return <LoadingBall />;

  if (error) return <Error error={error as Error} />;

  return (
    <Screen edges={['top', 'bottom']} className="flex-1">
      <LeagueHeader />

      <View className="flex-1 min-h-0">
        {!allLeagues.length ? (
          <EmptyList message="Create or join a league to get started." />
        ) : (
          <>
            <PrimaryLeagueCard showButton />

            <LeaguesList leagues={allLeagues} onPress={handleSelectLeague} />
          </>
        )}
      </View>

      <LeaguesIndicator used={activeLeagues} limit={maxLeagues} onPress={handleUpgrade} />

      {requiresLeagueActivation && (
        <LimitSelectModal
          leagues={allLeagues}
          maxLeagues={maxLeagues}
          selectedMemberIds={leagueActivationResolution.selectedMemberIds}
          isSaving={isUpdatingLeagueActivation}
          canSave={leagueActivationResolution.canSave}
          onToggleLeague={leagueActivationResolution.toggleLeague}
          onSave={leagueActivationResolution.save}
          onUpgrade={handleUpgrade}
        />
      )}
    </Screen>
  );
}
