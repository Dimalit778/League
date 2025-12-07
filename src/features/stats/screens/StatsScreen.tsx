import { Error } from '@/components/layout';
import { useMemberStats } from '@/features/members/hooks/useMembers';
import PredictionChart from '@/features/stats/components/stats/PredictionChart';
import SkeletonStats from '@/features/stats/components/stats/SkeletonStats';
import StatsCard from '@/features/stats/components/stats/StatsCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberStore } from '@/store/MemberStore';

import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { StatsType } from '../types';
const StatsScreen = () => {
  const memberId = useMemberStore((s) => s.memberId) as string;
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  const { data: stats, isLoading, error, refetch } = useMemberStats(memberId);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;

  if (isLoading) return <SkeletonStats />;
  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isFocused && isLoading} onRefresh={onRefresh} />}
      >
        <View className="flex-row mb-4 gap-x-4">
          <StatsCard title={t('Total Predictions')} value={stats?.totalPredictions ?? 0} />
          <StatsCard title={t('Total Points')} value={stats?.totalPoints ?? 0} />
        </View>

        <View className="flex-row mb-4 gap-x-4">
          <StatsCard title={t('Accuracy')} value={`${stats?.accuracy}%`} subtitle={t('Correct predictions')} />
          <StatsCard
            title={t('Avg. Points')}
            value={
              stats?.totalPoints && stats?.totalPredictions && stats?.totalPredictions > 0
                ? (stats?.totalPoints / stats?.totalPredictions).toFixed(1)
                : '0'
            }
            subtitle={t('Per prediction')}
          />
        </View>

        <PredictionChart {...(stats ?? ({} as StatsType))} />

        <View className="mb-4">
          <StatsCard title={t('Bingo Hits')} value={stats?.bingoHits ?? 0} subtitle={t('Bingo hits (5 points)')} />
        </View>

        <View className="mb-4">
          <StatsCard title={t('Regular Hits')} value={stats?.regularHits ?? 0} subtitle={t('Regular hits (3 point)')} />
        </View>

        <View className="mb-4">
          <StatsCard
            title={t('Missed')}
            value={stats?.missedHits ?? 0}
            subtitle={t('Incorrect predictions (0 points)')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default StatsScreen;
