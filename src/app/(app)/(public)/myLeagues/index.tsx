import { Error, LoadingOverlay } from '@/components/layout';
import { SubscriptionStatus } from '@/components/subscription';
import { Button, MyImage } from '@/components/ui';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { useSubscription } from '@/hooks/useSubscription';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leagueService } from '@/services/leagueService';
import { useMemberStore } from '@/store/MemberStore';
import { MemberLeague } from '@/types';
import StarIcon from '@assets/icons/StarIcon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function MyLeagues() {
  const { session } = useCurrentSession();
  const queryClient = useQueryClient();
  const setMember = useMemberStore((s) => s.setMember);

  const userId = session?.user?.id as string;
  const {
    data: memberLeagues,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.users.leagues(userId),
    queryFn: () => leagueService.getUserLeagues(userId),
  });

  const { mutate: updatePrimaryLeague } = useMutation({
    mutationFn: (leagueId: string) =>
      leagueService.updatePrimaryLeague(userId, leagueId),
    onSuccess: (league) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.leagues(userId),
      });
      setMember(league);
    },
    onError: (error) => {
      console.error('Failed to update primary league:', error);
    },
  });

  const { data: subscription } = useSubscription();

  const handleSetPrimary = useCallback(
    (league: MemberLeague) => {
      setMember(league);
      if (!league.is_primary) {
        updatePrimaryLeague(league.league_id);
      }
      router.push('/(app)/(member)/(tabs)/League');
    },
    [updatePrimaryLeague]
  );

  if (error) return <Error error={error} />;

  return (
    <View className="flex-1 bg-background">
      {isLoading && <LoadingOverlay />}
      <View className="px-3 mt-2 mb-4">
        <SubscriptionStatus
          subscriptionType={subscription?.subscription_type || 'FREE'}
          expiresAt={subscription?.end_date}
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
          <View className="my-2 px-4">
            <View className="bg-surface p-4 rounded-xl">
              <TouchableOpacity
                onPress={() => handleSetPrimary(item)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <MyImage
                    source={{ uri: item.league.competition.logo }}
                    width={40}
                    height={40}
                  />

                  <View className="flex-1 ps-4 ">
                    <Text
                      className="text-2xl font-headBold text-text"
                      numberOfLines={1}
                    >
                      {item.league.name}
                    </Text>
                    <Text className="text-base text-muted">
                      {item.nickname}
                    </Text>
                  </View>

                  <View className="justify-end items-end">
                    {item.is_primary && <StarIcon size={36} />}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        updateCellsBatchingPeriod={50}
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />
    </View>
  );
}
