import { Error, Screen, useFloatBottomTabsInset } from '@/components/layout';
import { useGetLeagueAndMembers } from '@/features/leagues/hooks/useLeagues';
import { useMemberStats } from '@/features/members/hooks/useMembers';
import { StatsBestCategory } from '@/features/stats/components/stats/StatsBestCategory';
import { StatsHeroCard } from '@/features/stats/components/stats/StatsHeroCard';
import { StatsPredictionSection } from '@/features/stats/components/stats/StatsPredictionSection';
import { StatsRoundPerformance } from '@/features/stats/components/stats/StatsRoundPerformance';
import { StatsScreenHeader } from '@/features/stats/components/stats/StatsScreenHeader';
import SkeletonStats from '@/features/stats/components/stats/SkeletonStats';
import { selectLeagueId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

const StatsScreen = () => {
  const memberId = useMemberStore(selectMemberId) as string;
  const leagueId = useMemberStore(selectLeagueId);
  const memberData = useMemberStore((s) => s.activeMember);
  const isFocused = useIsFocused();
  const bottomTabsInset = useFloatBottomTabsInset();

  const { data: leagueData } = useGetLeagueAndMembers(leagueId);
  const { data: stats, isLoading, error, refetch } = useMemberStats(memberId);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading || !stats || !memberData) return <SkeletonStats />;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: bottomTabsInset + 16 }}
        refreshControl={<RefreshControl refreshing={isFocused && isLoading} onRefresh={onRefresh} />}
      >
        <StatsScreenHeader leagueName={leagueData?.name ?? '—'} />

        <StatsHeroCard
          nickname={memberData.nickname}
          avatarUrl={memberData.avatar_url}
          isPrimary={memberData.is_primary}
          stats={stats}
        />

        <StatsPredictionSection stats={stats} />

        <StatsRoundPerformance rounds={stats.roundPerformance ?? []} />

        <StatsBestCategory bestCategory={stats.bestCategory} />

        <View className="h-4" />
      </ScrollView>
    </Screen>
  );
};

export default StatsScreen;
