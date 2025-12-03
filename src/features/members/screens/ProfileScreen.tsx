import { Error, LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useDeleteLeague, useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { AvatarSection } from '@/features/members/components/profile/AvatarSection';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { NicknameSection } from '@/features/members/components/profile/NicknameSection';
import { ProfileSkeleton } from '@/features/members/components/profile/ProfileSkeleton';
import { useMemberStore } from '@/store/MemberStore';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useMemberProfile } from '../hooks/useMembers';

const ProfileScreen = () => {
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId) as string;
  const { data: memberData, isLoading: memberLoading, error: memberError } = useMemberProfile(memberId);
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(leagueId as string);
  const leaveLeague = useLeaveLeague();
  const deleteLeague = useDeleteLeague();

  const confirmLeaveLeague = () => {
    if (!leagueId) return;
    Alert.alert('Leave League', 'Are you sure you want to leave this league?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', onPress: () => leaveLeague.mutate(leagueId) },
    ]);
  };
  const confirmDeleteLeague = () => {
    if (!leagueId || !memberData?.user_id) return;
    Alert.alert('Delete League', 'Are you sure you want to delete this league?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteLeague.mutate({ leagueId, userId: memberData.user_id }) },
    ]);
  };

  if (memberLoading || leagueLoading) return <ProfileSkeleton />;
  if (memberError || leagueError)
    return <Error error={memberError || (leagueError as string | Error | { message: string })} />;
  if (!memberData || !leagueData) return <Error error="Member or league data not found" />;

  return (
    <KeyboardAwareScrollView bottomOffset={62} className="flex-1 bg-background">
      {(leaveLeague.isPending || deleteLeague.isPending) && <LoadingOverlay />}

      <AvatarSection nickname={memberData?.nickname} avatarUrl={memberData?.avatar_url} />

      <NicknameSection initialNickname={memberData?.nickname} />

      <LeagueDetailsSection league={leagueData} memberUserId={memberData?.user_id} />

      <View className="px-6 mt-4">
        <Button title="Leave League" variant="error" onPress={confirmLeaveLeague} disabled={leaveLeague.isPending} />
        {leagueData.owner_id === memberData?.user_id && (
          <View className=" flex-row justify-center  items-center mt-4">
            <Button
              title="Delete League"
              size="sm"
              color="red"
              onPress={confirmDeleteLeague}
              disabled={deleteLeague.isPending}
            />
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;
