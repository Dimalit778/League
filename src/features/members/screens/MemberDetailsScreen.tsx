import { Error, LoadingOverlay } from '@/components/layout';
import { AvatarImage, BackButton, Card } from '@/components/ui';
import FixturesList from '@/features/matches/components/matches/FixturesList';
import { useMemberDataAndStats } from '@/features/members/hooks/useMembers';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemberStatsType } from '../types';

const MemberDetailsScreen = ({ memberId }: { memberId: string }) => {
  const { data, error, isLoading } = useMemberDataAndStats(memberId);

  const { member, stats, totalFixtures = [] } = data ?? {};

  if (error) return <Error error={error} />;
  if (isLoading) return <LoadingOverlay />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton />

      <Card className="mx-3 px-4 p-2">
        <View className="flex-row items-center gap-3">
          <View className="w-16 h-16 rounded-full overflow-hidden">
            <AvatarImage nickname={member?.nickname ?? ''} path={member?.avatar_url || null} />
          </View>

          <View className="flex-1">
            <Text className="text-text text-lg font-bold" numberOfLines={1}>
              {member?.nickname}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="items-end">
              <Text className="text-muted text-[10px] uppercase tracking-wide mb-0.5">Points</Text>
              <Text className="text-primary text-base font-semibold">{stats?.totalPoints.toLocaleString() ?? 0}</Text>
            </View>
            <View className="h-6 w-px bg-border" />
            <View className="items-end">
              <Text className="text-muted text-[10px] uppercase tracking-wide mb-0.5">Position</Text>
              <Text className="text-primary text-base font-semibold">{stats?.position ?? '—'}</Text>
            </View>
          </View>
        </View>
      </Card>

      {stats && <MemberStats stats={stats} />}
      <FixturesList fixtures={totalFixtures} selectedFixture={1} handleFixturePress={() => {}} animateScroll={false} />
    </SafeAreaView>
  );
};

function MemberStats({ stats }: { stats?: MemberStatsType }) {
  const topRowStats = [
    {
      label: 'Predictions',
      value: stats?.totalPredictions ?? 0,
      color: 'text-text' as const,
    },
    {
      label: 'Accuracy',
      value: `${stats?.accuracy ?? 0}%`,
      color: 'text-text' as const,
    },
  ];

  const bottomRowStats = [
    {
      label: 'Bingo',
      value: stats?.bingoHits ?? 0,
      color: 'text-success' as const,
    },
    {
      label: 'Hits',
      value: stats?.regularHits ?? 0,
      color: 'text-primary' as const,
    },
    {
      label: 'Missed',
      value: stats?.missedHits ?? 0,
      color: 'text-error' as const,
    },
  ];

  return (
    <Card className="p-2 mx-3 my-2 ">
      <View className="flex-row mb-2">
        {topRowStats.map((item) => (
          <View key={item.label} className="flex-1 px-2">
            <View
              className={`bg-surface border border-border rounded-lg p-2 items-center justify-center ${
                item.color || ''
              }`}
            >
              <Text className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</Text>
              <Text className={`${item.color} text-base font-bold`}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row">
        {bottomRowStats.map((item) => (
          <View key={item.label} className="flex-1 px-2">
            <View
              className={`bg-surface border border-border rounded-lg p-2 items-center justify-center ${
                item.color || ''
              }`}
            >
              <Text className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</Text>
              <Text className={`${item.color} text-base font-bold`}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default MemberDetailsScreen;
