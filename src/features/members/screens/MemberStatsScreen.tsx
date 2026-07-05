import { Error, useFloatBottomTabsInset } from '@/components/layout';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import {
  SkeletonStats,
  StatsBestCategory,
  StatsHeroCard,
  StatsPredictionSection,
  StatsRoundPerformance,
} from '@/features/members/components/stats';
import { useMemberStats } from '@/features/members/hooks/useMembers';
import { usePrimaryMember } from '@/store/MemberStore';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

const MemberStatsScreen = () => {
  const member = usePrimaryMember();
  const isFocused = useIsFocused();
  const bottomTabsInset = useFloatBottomTabsInset();

  const { data: leagueData } = useGetLeagueAndMembers(member.leagueId);
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
      <StatsHeroCard
        nickname={member.nickname}
        avatarUrl={member.avatarUrl}
        isPrimary={member.isPrimary}
        stats={stats}
      />

      <StatsPredictionSection stats={stats} />

      <StatsRoundPerformance rounds={stats.roundPerformance ?? []} />

      <StatsBestCategory bestCategory={stats.bestCategory} />

      <View className="h-4" />
    </ScrollView>
  );
};

export default MemberStatsScreen;
