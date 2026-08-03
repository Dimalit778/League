import { useLeagueActivationResolution } from '@/features/leagues/hooks/useLeagueActivationResolution';
import {
  useMyLeagues,
  useReactivateLeaguesAfterProUpgrade,
  useUpdateLeagueActivation,
  useUpdatePrimaryLeague,
} from '@/features/leagues/hooks/useLeagues';
import { MyLeague, MyLeaguesResponse } from '@/features/leagues/types';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

function flattenMyLeagues(myLeagues?: MyLeaguesResponse | null): MyLeague[] {
  if (!myLeagues) return [];
  return [
    ...(myLeagues.primaryLeague ? [myLeagues.primaryLeague] : []),
    ...myLeagues.leagues,
    ...myLeagues.inactiveLeagues,
  ];
}

function toPrimaryLeague(member: MyLeague) {
  return {
    memberId: member.id,
    leagueId: member.league.id,
    competitionId: member.league.competition_id,
    seasonId: member.league.competition?.season_id ?? null,
    nickname: member.nickname,
    avatarUrl: member.avatar_url,
  };
}

export function useMyLeaguesScreen() {
  const memberId = usePrimaryLeagueStore((s) => s.memberId);
  const leagueId = usePrimaryLeagueStore((s) => s.leagueId);
  const competitionId = usePrimaryLeagueStore((s) => s.competitionId);
  const seasonId = usePrimaryLeagueStore((s) => s.seasonId);
  const nickname = usePrimaryLeagueStore((s) => s.nickname);
  const avatarUrl = usePrimaryLeagueStore((s) => s.avatarUrl);
  const setPrimaryLeague = usePrimaryLeagueStore((s) => s.setPrimaryLeague);

  const reactivateLeaguesAfterProUpgrade = useReactivateLeaguesAfterProUpgrade();

  const { data: myLeagues, isPending, error, refetch } = useMyLeagues();
  const { isPro, maxLeagues } = useSubscriptionLimits();
    const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { mutateAsync: updateLeagueActivation, isPending: isUpdatingLeagueActivation } =
    useUpdateLeagueActivation();

  const allLeagues = useMemo(() => flattenMyLeagues(myLeagues), [myLeagues]);
  const activeCount = allLeagues.filter((league) => league.active).length;
  const requiresLeagueActivation = !isPro && activeCount > maxLeagues;

  const leagueActivationResolution = useLeagueActivationResolution({
    leagues: allLeagues,
    maxLeagues,
    enabled: requiresLeagueActivation,
    updateLeagueActivation,
    refetch,
  });

  const selectLeague = useCallback(
    async (nextLeagueId: string) => {
      if (requiresLeagueActivation) return;

      const selectedLeague = allLeagues.find((l) => l.league.id === nextLeagueId);
      if (!selectedLeague) return;

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
      }

      const previousPrimaryLeague = {
        memberId,
        leagueId,
        competitionId,
        seasonId,
        nickname,
        avatarUrl,
      };
      setPrimaryLeague(toPrimaryLeague(selectedLeague));
      router.replace('/(app)/(league)/(tabs)');

      try {
        await updatePrimaryLeague({ leagueId: nextLeagueId });
      } catch {
        setPrimaryLeague(previousPrimaryLeague);
        router.replace('/(app)/(league)/(tabs)/MyLeagues');
      }
    },
    [
      allLeagues,
      avatarUrl,
      competitionId,
      isPro,
      leagueId,
      maxLeagues,
      memberId,
      nickname,
      seasonId,
      reactivateLeaguesAfterProUpgrade,
      requiresLeagueActivation,
      setPrimaryLeague,
      updateLeagueActivation,
      updatePrimaryLeague,
    ],
  );

  const upgrade = useCallback(async () => {
    const upgraded = await reactivateLeaguesAfterProUpgrade(allLeagues);
    if (upgraded) {
      void refetch();
    }
    return upgraded;
  }, [allLeagues, reactivateLeaguesAfterProUpgrade, refetch]);

  return {
    isLoading: isPending,
    error,
    allLeagues,
    activeCount,
    isPro,
    maxLeagues,
    hasPrimaryLeague: !!memberId && !!leagueId && !!competitionId,
    selectLeague,
    upgrade,
    limitSelect: requiresLeagueActivation
      ? {
          leagues: allLeagues,
          maxLeagues,
          selectedMemberIds: leagueActivationResolution.selectedMemberIds,
          isSaving: isUpdatingLeagueActivation,
          canSave: leagueActivationResolution.canSave,
          onToggleLeague: leagueActivationResolution.toggleLeague,
          onSave: leagueActivationResolution.save,
          onUpgrade: upgrade,
        }
      : null,
  };
}
