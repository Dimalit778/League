import { Card, CText } from '@/components/ui';
import { View } from 'react-native';
import { MemberStatsType } from '../types';

export default function MemberStats({ stats }: { stats?: MemberStatsType }) {
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
              <CText className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</CText>
              <CText className={`${item.color} text-base font-bold`}>{item.value}</CText>
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
              <CText className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</CText>
              <CText className={`${item.color} text-base font-bold`}>{item.value}</CText>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
