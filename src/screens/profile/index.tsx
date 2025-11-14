import { LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/hooks/useLeagues';
import { AvatarSection } from '@/screens/profile/components/AvatarSection';
import { LeagueDetailsSection } from '@/screens/profile/components/LeagueDetailsSection';
import { NicknameSection } from '@/screens/profile/components/NicknameSection';
import { ProfileSkeleton } from '@/screens/profile/components/ProfileSkeleton';
import { useStoreData } from '@/store/store';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const ProfileScreen = () => {
  const { member, league } = useStoreData();
  const { data: leagueData } = useGetLeagueAndMembers(league?.id);

  const leaveLeague = useLeaveLeague();

  const confirmLeaveLeague = useCallback(() => {
    if (!league?.id) return;
    Alert.alert(
      'Leave League',
      `Are you sure you want to leave "${league?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            leaveLeague.mutate(league.id, {
              onSuccess: () => {
                router.replace('/(app)/(public)/myLeagues');
              },
              onError: (error) => {
                Alert.alert('Error', error.message);
              },
            });
          },
        },
      ]
    );
  }, [leaveLeague, league?.id, league?.name]);

  if (!member || !league || !leagueData) return <ProfileSkeleton />;

  return (
    <KeyboardAwareScrollView bottomOffset={62} className="flex-1 bg-background">
      {leaveLeague.isPending && <LoadingOverlay />}

      <AvatarSection nickname={member.nickname} avatarUrl={member.avatar_url} />

      <NicknameSection initialNickname={member.nickname} />

      <LeagueDetailsSection
        league={leagueData}
        memberUserId={member?.user_id}
      />

      <View className="px-6 mt-4">
        <Button
          title="Leave League"
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeague.isPending}
          loading={leaveLeague.isPending}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;
