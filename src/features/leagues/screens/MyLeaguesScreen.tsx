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
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { leagueApi } from '../api/leagueApi';
import MyLeagueCard from '../components/MyLeagueCard';
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
    <View className="mb-4" style={{ paddingBottom }}>
      <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
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

type LeagueActivationResolutionProps = {
  leagues: MyLeagueType[];
  maxLeagues: number;
  selectedMemberIds: string[];
  isSaving: boolean;
  onToggleLeague: (memberId: string) => void;
  onSave: () => void;
  onUpgrade: () => void;
};

function LeagueActivationResolution({
  leagues,
  maxLeagues,
  selectedMemberIds,
  isSaving,
  onToggleLeague,
  onSave,
  onUpgrade,
}: LeagueActivationResolutionProps) {
  const { t } = useTranslation();
  const selectedCount = selectedMemberIds.length;
  const hasValidSelection = selectedCount <= maxLeagues && (maxLeagues === 0 || selectedCount > 0);
  const sortedLeagues = useMemo(() => sortLeaguesByActive(leagues), [leagues]);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View className="flex-1 justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
        <View className="rounded-2xl border border-border bg-background p-4" style={{ maxHeight: '82%' }}>
          <CText variant="h2" className="text-text">
            {t('Choose active leagues')}
          </CText>
          <CText variant="body" className="mt-2 text-muted">
            {t('Your free plan allows {{count}} active leagues. Choose which leagues stay active to continue.', {
              count: String(maxLeagues),
            })}
          </CText>
          <View className="mt-3 flex-row items-center justify-between">
            <CText variant="bodyBold" className={selectedCount > maxLeagues ? 'text-error' : 'text-text'}>
              {selectedCount}/{maxLeagues}
            </CText>
            <Pressable onPress={onUpgrade} className="rounded-lg border border-yellow-500 px-3 py-2">
              <CText variant="caption" bold className="text-yellow-500">
                {t('Upgrade to Pro')}
              </CText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 py-4">
            {sortedLeagues.map((league) => {
              const selected = selectedMemberIds.includes(league.id);
              const cannotSelect = !selected && selectedCount >= maxLeagues;

              return (
                <Pressable
                  key={league.id}
                  onPress={() => onToggleLeague(league.id)}
                  disabled={cannotSelect}
                  className={`rounded-xl border bg-surface p-4 ${selected ? 'border-primary' : 'border-border'} ${
                    cannotSelect || !league.active ? 'opacity-50' : ''
                  }`}
                  style={{ width: 220 }}
                >
                  <View className="min-h-[112px] justify-between">
                    <View className="flex-row items-start justify-between">
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full border ${
                          selected ? 'border-primary bg-primary' : 'border-muted'
                        }`}
                      >
                        {selected && <View className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </View>
                      {league.is_primary && (
                        <CText variant="caption" bold className="text-primary">
                          {t('Primary')}
                        </CText>
                      )}
                    </View>

                    <View>
                      <CText variant="bodyBold" numberOfLines={1} className="text-text">
                        {league.league.name}
                      </CText>
                      <CText variant="caption" numberOfLines={1} className="text-muted">
                        {league.league.competition?.name ?? t('Unknown League')}
                      </CText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Button
            title={t('Save active leagues')}
            size="lg"
            onPress={onSave}
            loading={isSaving}
            disabled={!hasValidSelection}
          />
        </View>
      </View>
    </Modal>
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

  const sortedLeagues = useMemo(() => sortLeaguesByActive(leagues), [leagues]);

  return (
    <ScrollView
      horizontal
      refreshControl={refreshControl}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-3 px-2 mt-4"
    >
      {leagues.length === 0 ? (
        <View className="pt-10 w-full">
          <CText className="text-center text-muted font-bold text-lg">Create or join a league to get started</CText>
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
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: leagues, isPending, isFetching, error, refetch } = useMyLeagues();
  const { isPro, leaguesCount, totalLeaguesCount, maxLeagues, reachedLimit, exceededLimit, usagePercent } =
    useSubscriptionLimits();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { mutateAsync: updateLeagueActivation, isPending: isUpdatingLeagueActivation } = useUpdateLeagueActivation();
  const activeMember = useMemberStore((s) => s.activeMember);
  const setActiveMember = useMemberStore((s) => s.setActiveMember);
  const openPaywall = usePaywall();
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
      <LeagueActionsHeader reachedLimit={reachedLimit} isPro={isPro} onUpgrade={openPaywall} />
      <LeaguesList
        leagues={leagues ?? []}
        isFetching={isFetching}
        onRefresh={refetch}
        onSelectLeague={handleSelectLeague}
      />
      <LeaguesUsageCard
        leaguesCount={leaguesCount}
        totalLeaguesCount={totalLeaguesCount}
        maxLeagues={maxLeagues}
        reachedLimit={reachedLimit}
        usagePercent={usagePercent}
        paddingBottom={insets.bottom}
      />
      {requiresLeagueActivation && (
        <LeagueActivationResolution
          leagues={leagues ?? []}
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
