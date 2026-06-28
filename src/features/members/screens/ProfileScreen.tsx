import { Error, LoadingOverlay, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { Button, CText } from '@/components/ui';
import { useDeleteLeague, useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { AvatarSection } from '@/features/members/components/profile/AvatarSection';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { NicknameSection } from '@/features/members/components/profile/NicknameSection';
import { ProfileSkeleton } from '@/features/members/components/ProfileSkeleton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useMemberProfile } from '../hooks/useMembers';

const ProfileScreen = () => {
  const leagueId = useMemberStore(selectLeagueId);
  const memberId = useMemberStore(selectMemberId);
  const { t } = useTranslation();
  const { data: memberData, isLoading: memberLoading, error: memberError } = useMemberProfile(memberId);
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(leagueId);
  const bottomTabsInset = useFloatBottomTabsInset();
  const leaveLeague = useLeaveLeague();
  const deleteLeague = useDeleteLeague();

  const { DialogComponent } = useConfirmDialog();
  const { showAlert } = useAlert();

  const isOwner = memberData?.user_id === leagueData?.owner_id;

  const confirmLeaveLeague = () => {
    if (!leagueId) return;
    showAlert({
      title: t('Leave League'),
      message: t('Are you sure you want to leave this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Leave'), style: 'destructive', onPress: () => leaveLeague.mutate(leagueId) },
      ],
    });
  };

  const confirmDeleteLeague = () => {
    if (!leagueId || !leagueData) return;
    showAlert({
      title: t('Delete League'),
      message: t('Are you sure you want to delete this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => deleteLeague.mutate({ leagueId, ownerId: leagueData.owner_id }),
        },
      ],
    });
  };

  if (memberLoading || leagueLoading) return <ProfileSkeleton />;
  if (memberError || leagueError)
    return <Error error={memberError || (leagueError as string | Error | { message: string })} />;
  if (!memberData || !leagueData) return <Error error={t('Member or league data not found')} />;

  return (
    <Screen>
      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomTabsInset }}
      >
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
        </View>
        {isOwner && (
          <View className="mx-auto mt-6">
            <Pressable
              onPress={confirmDeleteLeague}
              className="flex-row items-center gap-2 bg-gray-300 rounded-lg px-4 py-2"
            >
              <FontAwesome6 name="trash" size={24} color="red" />
              <CText variant="body" bold className="text-red-500">
                {t('Delete League')}
              </CText>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
      <DialogComponent />
    </Screen>
  );
};

export default ProfileScreen;
