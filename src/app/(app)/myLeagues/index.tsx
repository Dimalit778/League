import { Error, LoadingOverlay, Screen, TopBar } from '@/components/layout';

import LeagueCard from '@/components/myLeagues/LeagueCard';
import { SubscriptionStatus } from '@/components/subscription';
import { Button } from '@/components/ui';
import {
  useLeaveLeague,
  useMyLeagues,
  useUpdatePrimaryLeague,
} from '@/hooks/useLeagues';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionService } from '@/services/subscriptionService';
import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';

export default function MyLeagues() {
  const { member } = useMemberStore();
  const { data: leagues, isLoading, error, refetch } = useMyLeagues();
  const { data: subscription } = useSubscription();
  const swipeableRefs = useRef<Map<string, any>>(new Map());

  const updatePrimaryLeague = useUpdatePrimaryLeague();
  const leaveLeague = useLeaveLeague();

  // Get subscription limits
  const subscriptionType = subscription?.subscription_type || 'FREE';
  const limits = subscriptionService.getSubscriptionLimits(subscriptionType);

  const handleSetPrimary = (leagueId: string, isPrimary: boolean) => {
    if (isPrimary) {
      router.push('/(app)/(tabs)/League');
      return;
    }
    updatePrimaryLeague.mutate({ leagueId, userId: member?.user_id as string });
  };

  const handleLeaveLeague = (leagueId: string, leagueName: string) => {
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
  };

  if (error) return <Error error={error} />;

  return (
    <Screen>
      <TopBar showLeagueName={false} />
      {isLoading ||
        ((updatePrimaryLeague.isPending || leaveLeague.isPending) && (
          <LoadingOverlay />
        ))}

      <View className="px-3 mt-2 mb-4">
        <SubscriptionStatus
          subscriptionType={subscriptionType}
          expiresAt={subscription?.end_date}
        />

        <Text className="text-textMuted text-sm mb-2">
          {`Your current plan allows you to join up to ${limits.maxLeagues} leagues`}
        </Text>

        {leagues && leagues.length >= limits.maxLeagues && (
          <Text className="text-error text-sm mb-2">
            You've reached your league limit. Upgrade your subscription to join
            or create more leagues.
          </Text>
        )}
      </View>

      <View className="flex-row justify-between mb-4 px-3">
        <Button
          title="Create League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/select-competition')}
          disabled={leagues && leagues.length >= limits.maxLeagues}
        />
        <Button
          title="Join League"
          variant="secondary"
          size="md"
          onPress={() => router.push('/myLeagues/join-league')}
          disabled={leagues && leagues.length >= limits.maxLeagues}
        />
      </View>

      <FlatList
        data={leagues}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LeagueCard
            item={item}
            onSetPrimary={() => handleSetPrimary(item.id, item.is_primary)}
            onLeaveLeague={() => handleLeaveLeague(item.id, item.name)}
            swipeableRef={(ref: any) => swipeableRefs.current.set(item.id, ref)}
          />
        )}
      />
    </Screen>
  );
}
