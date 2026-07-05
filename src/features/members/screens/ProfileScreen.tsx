import { Error, LoadingOverlay, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useDeleteLeague, useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { ProfileAchievements } from '@/features/members/components/profile/ProfileAchievements';
import { ProfileActionsMenu } from '@/features/members/components/profile/ProfileActionsMenu';
import { ProfileHeroCard } from '@/features/members/components/profile/ProfileHeroCard';
import { ProfileLeagueDetails } from '@/features/members/components/profile/ProfileLeagueDetails';
import { ProfileNicknameEdit } from '@/features/members/components/profile/ProfileNicknameEdit';
import { ProfileSkeleton } from '@/features/members/components/ProfileSkeleton';
import { useMemberStats } from '@/features/members/hooks/useMembers';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { usePrimaryMember } from '@/store/MemberStore';
import { ScrollView, View } from 'react-native';

const ProfileScreen = () => {
  const member = usePrimaryMember();
  const { t } = useTranslation();
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(member.leagueId);
  const { data: stats, isLoading: statsLoading } = useMemberStats(member.memberId);
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
        { text: t('Leave'), style: 'destructive', onPress: () => leaveLeague.mutate(member.leagueId) },
      ],
    });
  };

  const confirmDeleteLeague = () => {
    if (!leagueData || !member.leagueId) return;
    showAlert({
      title: t('Delete League'),
      message: t('Are you sure you want to delete this league?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => deleteLeague.mutate({ leagueId: member.leagueId, ownerId: leagueData.owner_id }),
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

        <ProfileHeroCard
          nickname={member.nickname}
          avatarUrl={member.avatarUrl}
          leagueName={leagueData.name}
          isPrimary={member.isPrimary}
          joinedAt={member.createdAt}
          stats={stats}
        />

        <ProfileNicknameEdit initialNickname={member.nickname} />

        <ProfileLeagueDetails league={leagueData} memberUserId={member.memberId} />

        <ProfileAchievements stats={stats} />

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
