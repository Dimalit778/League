import { Error, LoadingOverlay, Screen, TopBar } from '@/components/layout';
import LeagueCard from '@/components/myLeagues/LeagueCard';
import { SubscriptionStatus } from '@/components/subscription';
import { Button } from '@/components/ui';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { useGetUserLeagues, useUpdatePrimaryLeague } from '@/hooks/useLeagues';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionService } from '@/services/subscriptionService';
import { MemberLeague } from '@/types';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';

export default function MyLeagues() {
  const { session } = useCurrentSession();
  const userId = session?.user?.id as string;
  const { data: memberLeagues, isLoading, error } = useGetUserLeagues();
  const { data: subscription } = useSubscription();

  const updatePrimaryLeague = useUpdatePrimaryLeague();

  const subscriptionType = subscription?.subscription_type || 'FREE';
  const expiresAt = subscription?.end_date;
  const limits = subscriptionService.getSubscriptionLimits(subscriptionType);

  const handleSetPrimary = useCallback(
    (league: MemberLeague) => {
      if (league.is_primary) {
        return router.push('/(app)/(tabs)/League');
      }
      updatePrimaryLeague.mutate(
        { userId, leagueId: league.league_id },
        {
          onSuccess: () => {
            router.push('/(app)/(tabs)/League');
          },
        }
      );
    },
    [updatePrimaryLeague, userId]
  );

  if (error) return <Error error={error} />;

  const loading = updatePrimaryLeague.isPending || isLoading;

  return (
    <Screen>
      <TopBar showLeagueName={false} />
      {loading && <LoadingOverlay />}

      <View className="px-3 mt-2 mb-4">
        <SubscriptionStatus
          subscriptionType={subscriptionType}
          expiresAt={expiresAt}
        />
      </View>

      <View className="flex-row justify-between mb-4 px-3">
        <Button
          title="Create League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/select-competition')}
        />
        <Button
          title="Join League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/join-league')}
        />
      </View>
      <FlatList
        data={memberLeagues}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        scrollEnabled={memberLeagues && memberLeagues.length > 0}
        ListEmptyComponent={() => (
          <View className="my-10 mx-3">
            <Text className="text-center text-muted text-2xl">
              No leagues found
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <LeagueCard item={item} onSetPrimary={() => handleSetPrimary(item)} />
        )}
      />
    </Screen>
  );
}
