import { StatItem } from '@/components/shared';
import { Card } from '@/components/ui';
import { StatsType } from '@/types';
import { View } from 'react-native';

export default function MemberStats({ stats }: { stats?: StatsType }) {
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
            <StatItem label={item.label} value={item.value} color={item.color} />
          </View>
        ))}
      </View>

      <View className="flex-row">
        {bottomRowStats.map((item) => (
          <View key={item.label} className="flex-1 px-2">
            <StatItem label={item.label} value={item.value} color={item.color} />
          </View>
        ))}
      </View>
    </Card>
  );
}
