import { Error, useFloatBottomTabsInset } from '@/components/layout';
import { ProfileHeroCard } from '@/features/members/components/profile/ProfileHeroCard';
import { ProfileNicknameEdit } from '@/features/members/components/profile/ProfileNicknameEdit';
import {
  SkeletonStats,
  StatsBestCategory,
  StatsHeroCard,
  StatsPredictionSection,
  StatsRoundPerformance,
} from '@/features/members/components/stats';
import { Achievements } from '@/features/members/components/stats/Achievement';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useMemberStats } from '@/features/members/hooks/useMemberStats';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = () => {
  const memberId = useMemberId();
  const bottomInset = useFloatBottomTabsInset();
  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const { data: stats, isLoading, error } = useMemberStats(memberId);

  if (error) return <Error error={error} />;
  if (isLoading || memberLoading || !stats || !member) return <SkeletonStats />;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: bottomInset }}>
      <ProfileHeroCard />
      <ProfileNicknameEdit initialNickname={member.nickname ?? ''} />

      <View className="mt-2">
        <StatsHeroCard points={stats.totalPoints} rank={stats.rank ?? 0} />
      </View>
      <StatsPredictionSection stats={stats} />
      <Achievements stats={stats} />
      <StatsRoundPerformance rounds={stats.roundPerformance ?? []} />
      <StatsBestCategory bestCategory={stats.bestCategory} />

      <View className="h-4" />
    </ScrollView>
  );
};

export default ProfileScreen;
