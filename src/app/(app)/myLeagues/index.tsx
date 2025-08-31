import { Error, LoadingOverlay, Screen, TopBar } from '@/components/layout';

import LeagueCard from '@/components/myLeagues/LeagueCard';
import { Button } from '@/components/ui';
import {
  useLeaveLeague,
  useMyLeagues,
  useUpdatePrimaryLeague,
} from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Alert, FlatList, View } from 'react-native';

export default function MyLeagues() {
  const { member } = useMemberStore();
  const { data: leagues, isLoading, error, refetch } = useMyLeagues();
  const swipeableRefs = useRef<Map<string, any>>(new Map());
  const updatePrimaryLeague = useUpdatePrimaryLeague();
  const leaveLeague = useLeaveLeague(); //need to pass leagueId and userId

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

      <View className="flex-row justify-between my-4 px-3">
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
