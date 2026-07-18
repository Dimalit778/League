import { Error, useFloatBottomTabsInset } from '@/components/layout';
import {
  SkeletonStats,
  StatsBestCategory,
  StatsHeroCard,
  StatsPredictionSection,
  StatsRoundPerformance,
} from '@/features/memberStats/components';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { usePrimaryMember } from '@/store/MemberStore';
import { useCallback } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Achievements } from './components/Achievement';

const MemberStatsScreen = () => {
  const member = usePrimaryMember();
  const bottomInset = useFloatBottomTabsInset();
  const { data: stats, isLoading, error, refetch } = useMemberStats(member.memberId);

  const onRefresh = useCallback(() => refetch(), [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading || !stats) return <SkeletonStats />;

  return (
    <ScrollView className="flex-1 pt-2" contentContainerStyle={{ paddingBottom: bottomInset }}>
      <StatsHeroCard points={stats.totalPoints} rank={stats.position ?? 0} />

      <StatsPredictionSection stats={stats} />
      <Achievements stats={stats} />

      <StatsRoundPerformance rounds={stats.roundPerformance ?? []} />

      <StatsBestCategory bestCategory={stats.bestCategory} />

      <View className="h-4" />
    </ScrollView>
  );
};

export default MemberStatsScreen;
