import { Error, LoadingOverlay, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useDeleteLeague, useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { ProfileSkeleton } from '@/features/members/components/ProfileSkeleton';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { ProfileActionsMenu } from '@/features/profile/components/ProfileActionsMenu';
import { ProfileHeroCard } from '@/features/profile/components/ProfileHeroCard';
import { ProfileLeagueDetails } from '@/features/profile/components/ProfileLeagueDetails';
import { ProfileNicknameEdit } from '@/features/profile/components/ProfileNicknameEdit';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { usePrimaryMember } from '@/store/MemberStore';
import { ScrollView, View } from 'react-native';

const ProfileScreen = () => {
  const member = usePrimaryMember();
  const { t } = useTranslation();

  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(member.leagueId);
  console.log('member', JSON.stringify(member, null, 2));
  console.log('leagueData', JSON.stringify(leagueData, null, 2));
  const { data: stats, isLoading: statsLoading } = useMemberStats(member.memberId ?? '');
  const bottomTabsInset = useFloatBottomTabsInset();
  const leaveLeague = useLeaveLeague();
  const deleteLeague = useDeleteLeague();

  const { DialogComponent } = useConfirmDialog();
  const { showAlert } = useAlert();

  const isOwner = member.memberId === leagueData?.owner_id;

  const confirmLeaveLeague = () => {
    showAlert({
      title: t('Leave League'),
      message: t('Are you sure you want to leave this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Leave'), style: 'destructive', onPress: () => leaveLeague.mutate(member.leagueId ?? '') },
      ],
    });
  };

  const confirmDeleteLeague = () => {
    if ((!leagueData || !member.leagueId) ?? '') return;
    showAlert({
      title: t('Delete League'),
      message: t('Are you sure you want to delete this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => deleteLeague.mutate({ leagueId: member.leagueId ?? '', ownerId: leagueData.owner_id }),
        },
      ],
    });
  };

  if (leagueLoading || statsLoading) return <ProfileSkeleton />;
  if (leagueError) return <Error error={leagueError as string | Error | { message: string }} />;
  if (!leagueData) return <Error error={t('Member or league data not found')} />;

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomTabsInset + 16 }}
      >
        {(leaveLeague.isPending || deleteLeague.isPending) && <LoadingOverlay />}

        <ProfileHeroCard />

        <ProfileNicknameEdit initialNickname={member.nickname ?? ''} />

        <ProfileLeagueDetails league={leagueData} memberUserId={member.memberId ?? ''} />

        <ProfileActionsMenu
          leagueName={leagueData.name}
          joinCode={leagueData.join_code}
          competitionArea={member.competitionArea ?? undefined}
          onLeave={confirmLeaveLeague}
          isOwner={isOwner}
          onDelete={confirmDeleteLeague}
          leavePending={leaveLeague.isPending}
        />

        <View className="h-4" />
      </ScrollView>
      <DialogComponent />
    </Screen>
  );
};

export default ProfileScreen;
