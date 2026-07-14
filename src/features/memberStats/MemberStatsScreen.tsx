import { Error } from '@/components/layout';
import {
  SkeletonStats,
  StatsBestCategory,
  StatsHeroCard,
  StatsPredictionSection,
  StatsRoundPerformance,
} from '@/features/memberStats/components';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { usePrimaryMember } from '@/store/MemberStore';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Achievements } from './components/Achievement';

const MemberStatsScreen = () => {
  const member = usePrimaryMember();
  const isFocused = useIsFocused();

  const { data: stats, isLoading, error, refetch } = useMemberStats(member.memberId);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading || !stats) return <SkeletonStats />;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isFocused && isLoading} onRefresh={onRefresh} />}
    >
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
