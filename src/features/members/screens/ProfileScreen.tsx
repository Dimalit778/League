import { LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { AvatarSection } from '@/features/members/components/profile/AvatarSection';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { NicknameSection } from '@/features/members/components/profile/NicknameSection';
import { ProfileSkeleton } from '@/features/members/components/profile/ProfileSkeleton';
import { useMemberStore } from '@/store/MemberStore';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const ProfileScreen = () => {
  const leagueId = useMemberStore((s) => s.leagueId);
  const member = useMemberStore((s) => s.member);
  const { data: leagueData } = useGetLeagueAndMembers(leagueId!);

  const leaveLeague = useLeaveLeague();

  const confirmLeaveLeague = useCallback(() => {
    if (!leagueId) return;
    Alert.alert('Leave League', `Are you sure you want to leave "${leagueData?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          leaveLeague.mutate(leagueId!, {
            onSuccess: () => {
              router.replace('/(app)/(public)/myLeagues');
            },
            onError: (error) => {
              Alert.alert('Error', error.message);
            },
          });
        },
      },
    ]);
  }, [leaveLeague, leagueId, leagueData?.name]);

  if (!member || !leagueId || !leagueData) return <ProfileSkeleton />;

  return (
    <KeyboardAwareScrollView bottomOffset={62} className="flex-1 bg-background">
      {leaveLeague.isPending && <LoadingOverlay />}

      <AvatarSection nickname={member?.nickname!} avatarUrl={member?.avatar_url!} />

      <NicknameSection initialNickname={member?.nickname!} />

      <LeagueDetailsSection league={leagueData} memberUserId={member?.user_id!} />

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
