import { Error, LoadingOverlay, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useDeleteLeague, useGetLeagueAndMembers, useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { ProfileAchievements } from '@/features/members/components/profile/ProfileAchievements';
import { ProfileActionsMenu } from '@/features/members/components/profile/ProfileActionsMenu';
import { ProfileHeroCard } from '@/features/members/components/profile/ProfileHeroCard';
import { ProfileLeagueDetails } from '@/features/members/components/profile/ProfileLeagueDetails';
import { ProfileNicknameEdit } from '@/features/members/components/profile/ProfileNicknameEdit';
import { ProfileScreenHeader } from '@/features/members/components/profile/ProfileScreenHeader';
import { ProfileSkeleton } from '@/features/members/components/ProfileSkeleton';
import { useMemberStats } from '@/features/members/hooks/useMembers';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { ScrollView, View } from 'react-native';

const ProfileScreen = () => {
  const leagueId = useMemberStore(selectLeagueId);
  const memberId = useMemberStore(selectMemberId);
  const memberData = useMemberStore((s) => s.activeMember);
  const { t } = useTranslation();
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useGetLeagueAndMembers(leagueId);
  const { data: stats, isLoading: statsLoading } = useMemberStats(memberId ?? undefined);
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

  if (leagueLoading || statsLoading) return <ProfileSkeleton />;
  if (leagueError) return <Error error={leagueError as string | Error | { message: string }} />;
  if (!memberData || !leagueData) return <Error error={t('Member or league data not found')} />;

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomTabsInset + 16 }}
      >
        {(leaveLeague.isPending || deleteLeague.isPending) && <LoadingOverlay />}

        <ProfileScreenHeader leagueName={leagueData.name} />

        <ProfileHeroCard
          nickname={memberData.nickname}
          avatarUrl={memberData.avatar_url}
          leagueName={leagueData.name}
          isPrimary={memberData.is_primary}
          joinedAt={memberData.created_at}
          stats={stats}
        />

        <ProfileNicknameEdit initialNickname={memberData.nickname} />

        <ProfileLeagueDetails league={leagueData} memberUserId={memberData.user_id} />

        <ProfileAchievements stats={stats} />

        <ProfileActionsMenu
          leagueName={leagueData.name}
          joinCode={leagueData.join_code}
          competitionArea={leagueData.competition.area}
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
