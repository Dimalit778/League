import { useLeagueActivationResolution } from '@/features/leagues/hooks/useLeagueActivationResolution';
import {
  useMyLeagues,
  useReactivateLeaguesAfterProUpgrade,
  useUpdateLeagueActivation,
} from '@/features/leagues/hooks/useLeagues';
import { useRequiresLeagueActivation } from '@/features/leagues/hooks/useRequiresLeagueActivation';
import {
  flattenMyLeagues,
  resolveActivationTargetCount,
  resolveVacantLeagueSlots,
  toggleLeagueActivationSelection,
} from '@/features/leagues/model/leagueActivation';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useMyLeaguesScreen() {
  const reactivateLeaguesAfterProUpgrade = useReactivateLeaguesAfterProUpgrade();

  const { data: myLeagues, isPending, error, refetch } = useMyLeagues();
  const { isPro, maxLeagues, isLoading: isSubscriptionLoading } = useSubscriptionLimits();
  const { mutateAsync: updateLeagueActivation, isPending: isUpdatingLeagueActivation } =
    useUpdateLeagueActivation();

  const allLeagues = useMemo(() => flattenMyLeagues(myLeagues), [myLeagues]);
  const activeCount = allLeagues.filter((league) => league.active).length;
  const inactiveLeagues = useMemo(() => allLeagues.filter((league) => !league.active), [allLeagues]);
  const eligibleInactiveLeagues = useMemo(
    () => inactiveLeagues.filter((league) => league.league.competition?.is_free !== false),
    [inactiveLeagues],
  );
  const requiresLeagueActivation = useRequiresLeagueActivation();
  const eligibleLeagueCount = useMemo(
    () => allLeagues.filter((league) => league.league.competition?.is_free !== false).length,
    [allLeagues],
  );
  const activationTargetCount = resolveActivationTargetCount(maxLeagues, eligibleLeagueCount);
  const { availableSlots: availableActivationSlots, requiresSelection } = resolveVacantLeagueSlots({
    isPro,
    activeCount,
    inactiveCount: eligibleInactiveLeagues.length,
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
    maxLeagues: activationTargetCount,
    enabled: requiresLeagueActivation,
    updateLeagueActivation,
    refetch,
  });

  const upgrade = useCallback(async () => {
    const upgraded = await reactivateLeaguesAfterProUpgrade(allLeagues);
    if (upgraded) {
      void refetch();
    }
    return upgraded;
  }, [allLeagues, reactivateLeaguesAfterProUpgrade, refetch]);

  return {
    isLoading: isPending || isSubscriptionLoading,
    error,
    activeCount,
    isPro,
    maxLeagues,
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
          maxLeagues: activationTargetCount,
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
