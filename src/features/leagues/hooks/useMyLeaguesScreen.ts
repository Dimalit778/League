import { useLeagueActivationResolution } from '@/features/leagues/hooks/useLeagueActivationResolution';
import {
  useMyLeagues,
  useReactivateLeaguesAfterProUpgrade,
  useUpdateLeagueActivation,
  useUpdatePrimaryLeague,
} from '@/features/leagues/hooks/useLeagues';
import { MyLeagueType, MyLeaguesResponseType } from '@/features/leagues/types';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { PrimaryMemberType, selectPrimaryMember, useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

function flattenMyLeagues(myLeagues?: MyLeaguesResponseType | null): MyLeagueType[] {
  if (!myLeagues) return [];
  return [
    ...(myLeagues.primaryLeague ? [myLeagues.primaryLeague] : []),
    ...myLeagues.leagues,
    ...myLeagues.inactiveLeagues,
  ];
}

function toPrimaryMember(member: MyLeagueType): PrimaryMemberType {
  const { league } = member;
  const { competition } = league;

  return {
    memberId: member.id,
    userId: member.user_id,
    isPrimary: true,
    active: true,
    nickname: member.nickname,
    avatarUrl: member.avatar_url,
    createdAt: member.created_at,
    leagueId: league.id,
    leagueName: league.name,
    competitionId: competition.id,
    competitionName: competition.name,
    competitionLogo: competition.logo,
    competitionFlag: competition.flag,
    competitionArea: competition.area,
    competitionType: competition.type as 'league' | 'cup',
  };
}

export function useMyLeaguesScreen() {
  const primaryMember = useMemberStore(selectPrimaryMember);
  const setPrimaryMember = useMemberStore((s) => s.setPrimaryMember);
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
    async (leagueId: string) => {
      if (requiresLeagueActivation) return;

      const selectedLeague = allLeagues.find((l) => l.league.id === leagueId);
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

      const previousPrimaryMember = primaryMember;
      setPrimaryMember(toPrimaryMember({ ...selectedLeague, active: true }));
      router.replace('/(app)/(league)/(tabs)');

      try {
        await updatePrimaryLeague({ leagueId });
      } catch {
        setPrimaryMember(previousPrimaryMember);
        router.replace('/(app)/(user)');
      }
    },
    [
      allLeagues,
      isPro,
      maxLeagues,
      primaryMember,
      reactivateLeaguesAfterProUpgrade,
      requiresLeagueActivation,
      setPrimaryMember,
      updateLeagueActivation,
      updatePrimaryLeague,
    ],
  );

  const upgrade = useCallback(async () => {
    const upgraded = await reactivateLeaguesAfterProUpgrade(allLeagues);
    if (upgraded) {
      await refetch();
    }
  }, [allLeagues, reactivateLeaguesAfterProUpgrade, refetch]);

  return {
    isLoading: isPending,
    error,
    allLeagues,
    activeCount,
    maxLeagues,
    hasPrimaryMember: !!primaryMember,
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
