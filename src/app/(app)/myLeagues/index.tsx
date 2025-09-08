import { Error, LoadingOverlay, Screen, TopBar } from '@/components/layout';
import LeagueCard from '@/components/myLeagues/LeagueCard';
import { SubscriptionStatus } from '@/components/subscription';
import { Button } from '@/components/ui';
import {
  useGetLeagues,
  useLeaveLeague,
  useUpdatePrimaryLeague,
} from '@/hooks/useLeagues';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionService } from '@/services/subscriptionService';
import { MemberLeague } from '@/types';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';

export default function MyLeagues() {
  const { data: memberLeagues, isLoading, error } = useGetLeagues();

  const updatePrimaryLeague = useUpdatePrimaryLeague();
  const leaveLeague = useLeaveLeague();

  const { data: subscription } = useSubscription();

  const subscriptionType = subscription?.subscription_type || 'FREE';
  const expiresAt = subscription?.end_date;
  const limits = subscriptionService.getSubscriptionLimits(subscriptionType);

  const swipeableRefs = useRef<Map<string, any>>(new Map());

  const handleSetPrimary = useCallback(
    (league: MemberLeague) => {
      if (league.is_primary) {
        router.push('/(app)/(tabs)/League');
        return;
      }
      updatePrimaryLeague.mutate({
        leagueId: league.league_id,
      });
    },
    [updatePrimaryLeague]
  );

  const handleLeaveLeague = useCallback(
    (leagueId: string, leagueName: string) => {
      Alert.alert(
        'Leave League',
        `Are you sure you want to leave "${leagueName}"? This will delete all your predictions.`,
        [
          {
            text: 'Cancel',
            onPress: () => swipeableRefs.current.get(leagueId)?.close(),
            style: 'cancel',
          },
          {
            text: 'Leave',
            onPress: () => {
              leaveLeague.mutate(leagueId);
              swipeableRefs.current.get(leagueId)?.close();
            },
            style: 'destructive',
          },
        ]
      );
    },
    [leaveLeague, swipeableRefs]
  );

  if (error) return <Error error={error} />;

  const loading =
    updatePrimaryLeague.isPending || leaveLeague.isPending || isLoading;

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
          <LeagueCard
            item={item}
            onSetPrimary={() => handleSetPrimary(item)}
            onLeaveLeague={() =>
              handleLeaveLeague(item.league_id, item.league.name)
            }
            swipeableRef={(ref: any) => swipeableRefs.current.set(item.id, ref)}
          />
        )}
      />
    </Screen>
  );
}
