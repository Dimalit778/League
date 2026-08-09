import { useCallback, useEffect, useState } from 'react';
import { MyLeague } from '../types';

type UseLeagueActivationResolutionParams = {
  leagues: MyLeague[];
  maxLeagues: number;
  enabled: boolean;
  updateLeagueActivation: (activeMemberIds: string[]) => Promise<unknown>;
  refetch: () => Promise<unknown>;
};

export function useLeagueActivationResolution({
  leagues,
  maxLeagues,
  enabled,
  updateLeagueActivation,
  refetch,
}: UseLeagueActivationResolutionParams) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const isEligible = useCallback(
    (memberId: string) => {
      const league = leagues.find((candidate) => candidate.id === memberId);
      return !!league && league.league.competition?.is_free !== false;
    },
    [leagues],
  );

  useEffect(() => {
    if (!enabled) return;

    setSelectedMemberIds((current) =>
      current.filter((memberId) => leagues.some((league) => league.id === memberId) && isEligible(memberId)),
    );
  }, [enabled, isEligible, leagues]);

  const toggleLeague = useCallback(
    (memberId: string) => {
      setSelectedMemberIds((current) => {
        if (current.includes(memberId)) {
          return current.filter((selectedMemberId) => selectedMemberId !== memberId);
        }

        if (!isEligible(memberId)) return current;
        if (current.length >= maxLeagues) return current;

        return [...current, memberId];
      });
    },
    [isEligible, maxLeagues],
  );

  const save = useCallback(async () => {
    if (selectedMemberIds.length !== maxLeagues) return;

    await updateLeagueActivation(selectedMemberIds);
    await refetch();
  }, [maxLeagues, refetch, selectedMemberIds, updateLeagueActivation]);

  const selectedCount = selectedMemberIds.length;
  const canSave = maxLeagues > 0 && selectedCount === maxLeagues;

  return {
    selectedMemberIds,
    selectedCount,
    canSave,
    toggleLeague,
    save,
  };
}
