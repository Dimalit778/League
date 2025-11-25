import { Error, LoadingOverlay } from '@/components/layout';
import { Button } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { AvatarSection } from '@/features/members/components/profile/AvatarSection';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { NicknameSection } from '@/features/members/components/profile/NicknameSection';
import { ProfileSkeleton } from '@/features/members/components/profile/ProfileSkeleton';
import { useMemberStore } from '@/store/MemberStore';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useMemberProfile } from '../hooks/useMembers';

const ProfileScreen = () => {
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId);
  const { data: memberData, isLoading: memberLoading, error: memberError } = useMemberProfile(memberId ?? '');
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(leagueId ?? '');
  const { mutate: leaveLeague, isPending: leaveLeaguePending } = useLeaveLeague();

  const confirmLeaveLeague = () => {
    if (!leagueId) return;
    leaveLeague(leagueId);
  };

  if (memberLoading || leagueLoading) return <ProfileSkeleton />;
  if (memberError || leagueError)
    return <Error error={memberError || (leagueError as string | Error | { message: string })} />;
  if (!memberData || !leagueData) return <Error error="Member or league data not found" />;

  return (
    <KeyboardAwareScrollView bottomOffset={62} className="flex-1 bg-background">
      {leaveLeaguePending && <LoadingOverlay />}

      <AvatarSection nickname={memberData?.nickname} avatarUrl={memberData?.avatar_url} />

      <NicknameSection initialNickname={memberData?.nickname} />

      <LeagueDetailsSection league={leagueData} memberUserId={memberData?.user_id} />

      <View className="px-6 mt-4">
        <Button
          title="Leave League"
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeaguePending}
          loading={leaveLeaguePending}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;
