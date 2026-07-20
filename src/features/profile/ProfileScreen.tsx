import { Error, useFloatBottomTabsInset } from '@/components/layout';
import { Achievements } from '@/features/memberStats/components/Achievement';
import {
  SkeletonStats,
  StatsBestCategory,
  StatsHeroCard,
  StatsPredictionSection,
  StatsRoundPerformance,
} from '@/features/memberStats/components';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { ProfileHeroCard } from '@/features/profile/components/ProfileHeroCard';
import { ProfileNicknameEdit } from '@/features/profile/components/ProfileNicknameEdit';
import { usePrimaryMember } from '@/store/MemberStore';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = () => {
  const member = usePrimaryMember();
  const bottomInset = useFloatBottomTabsInset();
  const { data: stats, isLoading, error } = useMemberStats(member.memberId);

  if (error) return <Error error={error} />;
  if (isLoading || !stats) return <SkeletonStats />;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: bottomInset }}>
      <ProfileHeroCard />
      <ProfileNicknameEdit initialNickname={member.nickname ?? ''} />

      <View className="mt-2">
        <StatsHeroCard points={stats.totalPoints} rank={stats.position ?? 0} />
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
