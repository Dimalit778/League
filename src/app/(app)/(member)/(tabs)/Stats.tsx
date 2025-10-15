import { Error } from '@/components/layout';
import PredictionChart from '@/components/stats/PredictionChart';
import SkeletonStats from '@/components/stats/SkeletonStats';
import StatsCard from '@/components/stats/StatsCard';
import { useMemberStats } from '@/hooks/useMembers';
import { useMemberStore } from '@/store/MemberStore';
import { MemberStatsType } from '@/types';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

const Stats = () => {
  const { member } = useMemberStore();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useMemberStats(member?.user_id);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;

  if (isLoading) return <SkeletonStats />;
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row mb-4">
          <StatsCard
            title="Total Predictions"
            value={stats?.totalPredictions ?? 0}
            className="flex-1 mr-2"
          />
          <StatsCard
            title="Total Points"
            value={stats?.totalPoints ?? 0}
            className="flex-1 ml-2"
          />
        </View>

        <View className="flex-row mb-4">
          <StatsCard
            title="Accuracy"
            value={`${stats?.accuracy}%`}
            subtitle="Correct predictions"
            className="flex-1 mr-2"
          />
          <StatsCard
            title="Avg. Points"
            value={
              stats?.totalPoints &&
              stats?.totalPredictions &&
              stats?.totalPredictions > 0
                ? (stats?.totalPoints / stats?.totalPredictions).toFixed(1)
                : '0'
            }
            subtitle="Per prediction"
            className="flex-1 ml-2"
          />
        </View>

        <PredictionChart {...(stats ?? ({} as MemberStatsType))} />

        <View className="mb-4">
          <StatsCard
            title="Bingo Hits"
            value={stats?.bingoHits ?? 0}
            subtitle="Exact score predictions (3 points)"
          />
        </View>

        <View className="mb-4">
          <StatsCard
            title="Regular Hits"
            value={stats?.regularHits ?? 0}
            subtitle="Correct outcome but not exact score (1 point)"
          />
        </View>

        <View className="mb-4">
          <StatsCard
            title="Missed"
            value={stats?.missedHits ?? 0}
            subtitle="Incorrect predictions (0 points)"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Stats;
