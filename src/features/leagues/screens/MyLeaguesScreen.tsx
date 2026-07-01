import { Error, LoadingBall, Screen } from '@/components/layout';
import { CText } from '@/components/ui/CText';
import { matchesApi } from '@/features/matches/api/matchesService';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { usePaywall } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { competitionApi } from '../api/competitionApi';
import { leagueApi } from '../api/leagueApi';
import { LeaguesIndicator } from '../components/leagues-indicator';
import LeaguesLimitActivation from '../components/leagues-limit-activation';
import MyLeagueCard from '../components/MyLeagueCard';
import PrimaryLeagueCard from '../components/primary-league';
import { useMyLeagues, useUpdateLeagueActivation, useUpdatePrimaryLeague } from '../hooks/useLeagues';
import { MyLeaguesResponseType } from '../types';

type LeaguesListProps = {
  myLeagues?: MyLeaguesResponseType | null;
  onSelectLeague: (leagueId: string, isPrimary: boolean) => void;
};

function LeaguesList({ myLeagues, onSelectLeague }: LeaguesListProps) {
  const { t } = useTranslation();
  const { primaryLeague, leagues, inactiveLeagues } = myLeagues ?? {
    primaryLeague: null,
    leagues: [],
    inactiveLeagues: [],
    totalLeagues: 0,
  };
  const hasLeagues = Boolean(primaryLeague) || leagues.length > 0 || inactiveLeagues.length > 0;

  if (!hasLeagues)
    return (
      <View className="pt-10 items-center w-full">
        <CText variant="bodyBold" className="text-center text-muted">
          {t('Create or join a league to get started.')}
        </CText>
      </View>
    );

  return (
    <>
      {primaryLeague && (
        <PrimaryLeagueCard
          leagueName={primaryLeague.league.name}
          nickname={primaryLeague.nickname}
          rank={1}
          points={100}
          pending={0}
          onPress={() => onSelectLeague(primaryLeague.league.id, primaryLeague.is_primary)}
        />
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 px-2 mt-4 flex-1"
      >
        {[...leagues, ...inactiveLeagues].map((league) => (
          <View key={league.league.id} className="w-[180px]">
            <MyLeagueCard item={league} onPress={() => onSelectLeague(league.league.id, league.is_primary)} />
          </View>
        ))}
      </ScrollView>
    </>
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

  const { data: myLeagues, isPending, isFetching, error, refetch } = useMyLeagues();
  const { isPro, leaguesCount, maxLeagues, exceededLimit } = useSubscriptionLimits();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { mutateAsync: updateLeagueActivation, isPending: isUpdatingLeagueActivation } = useUpdateLeagueActivation();

  const [selectedActiveMemberIds, setSelectedActiveMemberIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (!requiresLeagueActivation) return;

    setSelectedActiveMemberIds((current) => {
      const validCurrent = current.filter((memberId) => allLeagues.some((league) => league.id === memberId));
      if (validCurrent.length > 0) return validCurrent;
      return [];
    });
  }, [allLeagues, requiresLeagueActivation]);

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

    const previousActiveMember = activeMember;
    setActiveMember(memberToActivate);

    const competitionId = memberToActivate.league.competition?.id;
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

    router.replace('/(app)/(member)/(tabs)/Home');

    if (isPrimary) return;

    try {
      await updatePrimaryLeague({ leagueId });
    } catch {
      setActiveMember(previousActiveMember);
      router.replace('/(app)/(public)/myLeagues');
    }
  };

  if (isAuthLoading || isLoading) return <LoadingBall />;

  if (error) return <Error error={error as Error} />;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <LeaguesList myLeagues={myLeagues} onSelectLeague={handleSelectLeague} />
      </ScrollView>
      <View style={{ paddingBottom: insets.bottom }}>
        <LeaguesIndicator used={leaguesCount} limit={maxLeagues} onPress={openPaywall} />
      </View>

      {requiresLeagueActivation && (
        <LeaguesLimitActivation
          leagues={allLeagues}
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
