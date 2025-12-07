import { Error, LoadingOverlay } from '@/components/layout';
import { Button, CText } from '@/components/ui';
import { useDeleteLeague, useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { AvatarSection } from '@/features/members/components/profile/AvatarSection';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { NicknameSection } from '@/features/members/components/profile/NicknameSection';
import { ProfileSkeleton } from '@/features/members/components/profile/ProfileSkeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { Alert, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useMemberProfile } from '../hooks/useMembers';

const ProfileScreen = () => {
  const leagueId = useMemberStore((s) => s.leagueId);
  const memberId = useMemberStore((s) => s.memberId) as string;
  const { t } = useTranslation();
  const { data: memberData, isLoading: memberLoading, error: memberError } = useMemberProfile(memberId);
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(leagueId as string);
  const leaveLeague = useLeaveLeague();
  const deleteLeague = useDeleteLeague();

  const confirmLeaveLeague = () => {
    if (!leagueId) return;
    Alert.alert(t('Leave League'), t('Are you sure you want to leave this league?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Leave'), onPress: () => leaveLeague.mutate(leagueId) },
    ]);
  };
  const confirmDeleteLeague = () => {
    if (!leagueId || !memberData?.user_id) return;
    Alert.alert(t('Delete League'), t('Are you sure you want to delete this league?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), onPress: () => deleteLeague.mutate({ leagueId, userId: memberData.user_id }) },
    ]);
  };

  if (memberLoading || leagueLoading) return <ProfileSkeleton />;
  if (memberError || leagueError)
    return <Error error={memberError || (leagueError as string | Error | { message: string })} />;
  if (!memberData || !leagueData) return <Error error={t('Member or league data not found')} />;

  return (
    <KeyboardAwareScrollView bottomOffset={62} className="flex-1 bg-background">
      {(leaveLeague.isPending || deleteLeague.isPending) && <LoadingOverlay />}

      <AvatarSection nickname={memberData?.nickname} avatarUrl={memberData?.avatar_url} />

      <NicknameSection initialNickname={memberData?.nickname} />

      <LeagueDetailsSection league={leagueData} memberUserId={memberData?.user_id} />

      <View className="px-6 mt-4">
        <Button
          title={t('Leave League')}
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeague.isPending}
        />
        {leagueData.owner_id === memberData?.user_id && (
          <View className=" flex-row justify-center  items-center mt-4">
            <TouchableOpacity
              onPress={confirmDeleteLeague}
              disabled={deleteLeague.isPending}
              className="flex-row items-center gap-2 bg-red-800 rounded-lg p-3"
            >
              <CText className="text-white text-sm font-semibold">{t('Delete League')}</CText>
              <FontAwesome6 name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;
