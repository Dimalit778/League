import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { Button } from '@/components/ui';

import { useTranslation } from '@/hooks/useTranslation';
import { useMemberStore } from '@/store/MemberStore';

import { CText } from '@/components/ui/CText';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyLeagueCard from '../components/MyLeagueCard';
import { useMyLeagues, useUpdatePrimaryLeague } from '../hooks/useLeagues';

const MyLeagues = () => {
  const { data: leagues, isLoading, error, refetch } = useMyLeagues();
  const { mutate: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();

  const setActiveMember = useMemberStore((s) => s.setActiveMember);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const handleSetPrimary = async (leagueId: string, isPrimary: boolean) => {
    if (isPrimary) return router.replace('/(app)/(member)/(tabs)/League');

    const selectedLeague = leagues?.find((l) => l.league.id === leagueId);

    if (selectedLeague) {
      setActiveMember(selectedLeague);
      router.replace('/(app)/(member)/(tabs)/League');
      updatePrimaryLeague({ leagueId });
    }
  };

  if (isLoading || !leagues || isLoadingSubscription) return <LoadingOverlay />;
  if (error) return <Error error={error as Error} />;

  const limit = subscription?.limits.maxLeagues ?? 0;
  const reachedLimit = limit > 0 && leagues.length >= limit;
  const usagePercent = limit > 0 ? Math.min((leagues.length / limit) * 100, 100) : 0;

  return (
    <Screen>
      {reachedLimit ? (
        <Pressable
          onPress={() => router.push('/(app)/(public)/subscription')}
          className="bg-yellow-500 py-2 m-4 rounded-md "
        >
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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-1 gap-3 p-2 mt-4"
      >
        {leagues.map((league) => (
          <MyLeagueCard
            key={league.league.id}
            item={league}
            handleSetPrimary={() => handleSetPrimary(league.league.id, league.is_primary)}
          />
        ))}
        {leagues.length === 0 && (
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
              {leagues.length}/{limit}
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
