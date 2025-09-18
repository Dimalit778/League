import { LoadingOverlay, Screen, TopBar } from '@/components/layout';
import LeagueContent from '@/components/profile/LeagueContent';
import { Button, ProfileImage } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Text, View } from 'react-native';

export default function Profile() {
  const { member } = useMemberStore();
  const leaveLeague = useLeaveLeague(member?.user_id as string);
  const { data: league, isLoading } = useGetLeagueAndMembers(
    member?.league_id as string
  );

  const isOwner = useMemo(
    () =>
      Boolean(
        member?.user_id &&
          league?.owner?.user_id &&
          member.user_id === league.owner.user_id
      ),
    [member?.user_id, league?.owner?.user_id]
  );
  const confirmLeaveLeague = () => {
    Alert.alert(
      'Leave League',
      `Are you sure you want to leave "${league?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () =>
            leaveLeague.mutate(league?.id as string, {
              onSuccess: () => {
                router.push('/(app)/(tabs)/League');
              },
              onError: (error) => {
                Alert.alert('Error', error.message);
              },
            }),
        },
      ]
    );
  };

  return (
    <Screen>
      {isLoading || (leaveLeague.isPending && <LoadingOverlay />)}
      <TopBar />
      <View className="bg-surface rounded-xl border border-border p-4 mb-4">
        <View className="flex-row items-center">
          <ProfileImage
            imageUrl={member?.avatar_url || ''}
            nickname={member?.nickname || ''}
            size="xl"
          />
          <View className="ml-4 flex-1">
            <Text className="text-text text-xl font-bold mb-2">
              {member?.nickname}
            </Text>
          </View>
        </View>
      </View>

      {league && <LeagueContent league={league} isOwner={isOwner} />}

      <View className="mt-auto mb-6">
        <Button
          title={'Leave League'}
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeague.isPending}
        />
      </View>
    </Screen>
  );
}
