import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { CText } from '@/components/ui/CText';
import { subscriptionApi } from '@/features/subscription/api/subscriptionApi';
import { DowngradeModal } from '@/features/subscription/components/DowngradeModal';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { purchasesService } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { useMemberStore } from '@/store/MemberStore';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { leagueApi } from '../api/leagueApi';
import MyLeagueCard from '../components/MyLeagueCard';
import { useMyLeagues, useUpdatePrimaryLeague } from '../hooks/useLeagues';

const MyLeagues = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const { data: leagues, isPending: isLeaguesPending, isFetching: isLeaguesFetching, error, refetch } = useMyLeagues();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { data: subscription } = useSubscription();
  console.log('subscription', JSON.stringify(subscription, null, 2));

  const queryClient = useQueryClient();
  const [modalDismissed, setModalDismissed] = useState(false);

  const activeMember = useMemberStore((s) => s.activeMember);
  const setActiveMember = useMemberStore((s) => s.setActiveMember);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const handleOpenPaywall = async () => {
    try {
      const payload = await purchasesService.presentPaywall();
      if (payload && userId) {
        await subscriptionApi.syncAfterPurchase(userId, payload);
        await queryClient.invalidateQueries({ queryKey: KEYS.subscriptions.detail(userId) });
      }
    } catch (error) {
      Alert.alert(t('Error'), t('Something went wrong'));
    }
  };

  const isLeaguesLoading = !!userId && (isLeaguesPending || isLeaguesFetching);
  const leaguesList = leagues ?? [];
  const handleSetPrimary = async (leagueId: string, isPrimary: boolean) => {
    const selectedLeague = leaguesList.find((l) => l.league.id === leagueId);

    if (!selectedLeague) return;

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

  if (isAuthLoading || isLeaguesLoading) {
    return (
      <Screen>
        <LoadingOverlay />
      </Screen>
    );
  }
  if (error) return <Error error={error as Error} />;

  const limit = subscription?.limits.ownedLeagues ?? 0;
  const reachedLimit = limit > 0 && leaguesList.length >= limit;
  const usagePercent = limit > 0 ? Math.min((leaguesList.length / limit) * 100, 100) : 0;

  const hasLockedDueToExpiry = leaguesList.some((l) => l.league.locked_reason === 'SUBSCRIPTION_EXPIRED');
  const showDowngradeModal = hasLockedDueToExpiry && !modalDismissed;

  return (
    <Screen>
      <DowngradeModal
        visible={showDowngradeModal}
        onChooseLeague={() => {
          setModalDismissed(true);
          router.push('/(app)/(public)/choose-active-league');
        }}
        onDismiss={() => setModalDismissed(true)}
      />
      {reachedLimit ? (
        <Pressable onPress={handleOpenPaywall} className="bg-yellow-500 py-2 m-4 rounded-md ">
          <CText variant="caption" bold className="text-black text-center">
            {t('Max leagues reached. Upgrade to continue.')}
          </CText>
        </Pressable>
      ) : (
        <View className="flex-row justify-between px-2">
          <Button
            title={t('Create League')}
            variant="outline"
            size="md"
            onPress={() => router.push('/myLeagues/select-competition')}
          />
          <Button
            title={t('Join League')}
            variant="outline"
            size="md"
            onPress={() => router.push('/myLeagues/join-league')}
          />
        </View>
      )}

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLeaguesFetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-1 gap-3 p-2 mt-4"
      >
        {leaguesList.map((league) => (
          <MyLeagueCard
            key={league.league.id}
            item={league}
            handleSetPrimary={() => handleSetPrimary(league.league.id, league.is_primary)}
          />
        ))}
        {leaguesList.length === 0 && (
          <View className="flex-1 pt-10">
            <CText className="text-center text-muted font-nunito-bold text-lg">
              Create or join a league to get started
            </CText>
          </View>
        )}
      </ScrollView>
      <View className="mb-4" style={{ paddingBottom: insets.bottom }}>
        <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <View className="flex-row justify-between items-center mb-2">
            <CText variant="body" bold>
              Leagues
            </CText>

            <CText variant="body" bold className={reachedLimit ? 'text-yellow-500 font-bold' : 'text-muted'}>
              {leaguesList.length}/{limit}
            </CText>
          </View>

          {/* Progress bar */}
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              style={{ width: `${usagePercent}%` }}
              className={`h-full ${reachedLimit ? 'bg-yellow-500' : 'bg-secondary'}`}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default MyLeagues;
