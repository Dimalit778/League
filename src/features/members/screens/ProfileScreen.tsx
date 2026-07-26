import { Error, useFloatBottomTabsInset } from '@/components/layout';
import { LeagueDetailsSection } from '@/features/members/components/profile/LeagueDetailsSection';
import { ProfileHeroCard } from '@/features/members/components/profile/ProfileHeroCard';
import { ProfileNicknameEdit } from '@/features/members/components/profile/ProfileNicknameEdit';
import { SkeletonStats } from '@/features/members/components/stats';
import { Achievements } from '@/features/members/components/stats/Achievement';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueId, useMemberId } from '@/store/PrimaryLeagueStore';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = () => {
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const userId = useAuthStore((s) => s.user?.id);
  const bottomInset = useFloatBottomTabsInset();
  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const { data: stats, isLoading, error } = useMemberStats(memberId);
  const { data: league, isLoading: leagueLoading } = useGetLeagueAndMembers(leagueId);

  if (error) return <Error error={error} />;
  if (isLoading || memberLoading || leagueLoading || !stats || !member) return <SkeletonStats />;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: bottomInset }}>
      <ProfileHeroCard rank={stats.rank ?? 0} points={stats.totalPoints} />
      <ProfileNicknameEdit initialNickname={member.nickname ?? ''} />

      {league && <LeagueDetailsSection league={league} memberUserId={userId ?? ''} />}

      <Achievements stats={stats} />

      <View className="h-4" />
    </ScrollView>
  );
};

export default ProfileScreen;
