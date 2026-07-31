import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { ProfileHeroCard } from '@/features/members/components/profile/ProfileHeroCard';
import { ProfileNicknameEdit } from '@/features/members/components/profile/ProfileNicknameEdit';
import { SkeletonStats } from '@/features/members/components/stats';
import { Achievements } from '@/features/members/components/stats/Achievement';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueId, useMemberId } from '@/store/PrimaryLeagueStore';
import { View } from 'react-native';

const ProfileScreen = () => {
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const userId = useAuthStore((s) => s.user?.id);
  const bottomInset = useFloatBottomTabsInset();
  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const { data: stats, isLoading, error } = useMemberStats(memberId);
  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);

  if (error) return <Error error={error} />;
  if (isLoading || memberLoading || leagueLoading || !stats || !member || !league) return <SkeletonStats />;

  return (
    <Screen scroll padding="horizontal" bottomInset={bottomInset} contentClassName="gap-4 pt-2">
      <ProfileHeroCard />
      <ProfileNicknameEdit initialNickname={member.nickname} />

      <LeagueDetailsSection league={league} memberUserId={userId ?? ''} />

      <Achievements stats={stats} />

      <View className="h-4" />
    </Screen>
  );
};

export default ProfileScreen;
