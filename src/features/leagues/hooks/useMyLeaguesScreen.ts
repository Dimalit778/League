import { useLeagueActivationResolution } from '@/features/leagues/hooks/useLeagueActivationResolution';
import {
  useMyLeagues,
  useReactivateLeaguesAfterProUpgrade,
  useUpdateLeagueActivation,
  useUpdatePrimaryLeague,
} from '@/features/leagues/hooks/useLeagues';
import { MyLeague, MyLeaguesResponse } from '@/features/leagues/types';
import {
  resolveVacantLeagueSlots,
  toggleLeagueActivationSelection,
} from '@/features/leagues/model/leagueActivation';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const inactiveLeagues = useMemo(() => allLeagues.filter((league) => !league.active), [allLeagues]);
  const requiresLeagueActivation = !isPro && activeCount > maxLeagues;
  const { availableSlots: availableActivationSlots, requiresSelection } = resolveVacantLeagueSlots({
    isPro,
    activeCount,
    inactiveCount: inactiveLeagues.length,
    maxLeagues,
  });
  const canChooseInactiveLeagues =
    !requiresLeagueActivation &&
    requiresSelection;
  const [selectedInactiveMemberIds, setSelectedInactiveMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (!canChooseInactiveLeagues) {
      setSelectedInactiveMemberIds([]);
      return;
    }

    setSelectedInactiveMemberIds((current) =>
      current.filter((memberId) =>
        inactiveLeagues.some((league) => league.id === memberId && league.league.competition?.is_free !== false),
      ),
    );
  }, [canChooseInactiveLeagues, inactiveLeagues]);

  const toggleInactiveLeague = useCallback(
    (memberId: string) => {
      const league = inactiveLeagues.find((candidate) => candidate.id === memberId);
      if (!canChooseInactiveLeagues || !league) return;
      if (league.league.competition?.is_free === false) return;

      setSelectedInactiveMemberIds((current) =>
        toggleLeagueActivationSelection(current, memberId, availableActivationSlots),
      );
    },
    [availableActivationSlots, canChooseInactiveLeagues, inactiveLeagues],
  );

  const activateSelectedLeagues = useCallback(async () => {
    if (!canChooseInactiveLeagues || selectedInactiveMemberIds.length !== availableActivationSlots) return;

    const activeMemberIds: string[] = [];
    for (const league of allLeagues) {
      if (league.active) activeMemberIds.push(league.id);
    }
    await updateLeagueActivation([...activeMemberIds, ...selectedInactiveMemberIds]);
    setSelectedInactiveMemberIds([]);
  }, [
    allLeagues,
    availableActivationSlots,
    canChooseInactiveLeagues,
    selectedInactiveMemberIds,
    updateLeagueActivation,
  ]);

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
        router.replace('/(app)/(user)/leagues/my-leagues');
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
    activationSelection: canChooseInactiveLeagues
      ? {
          availableSlots: availableActivationSlots,
          selectedMemberIds: selectedInactiveMemberIds,
          isSaving: isUpdatingLeagueActivation,
          canSave: selectedInactiveMemberIds.length === availableActivationSlots,
          onToggleLeague: toggleInactiveLeague,
          onSave: activateSelectedLeagues,
        }
      : null,
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
