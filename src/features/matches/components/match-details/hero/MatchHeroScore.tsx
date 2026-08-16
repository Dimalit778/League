import { Text } from '@/components';
import type { MatchPresentation } from '@/features/matches/model/matchPresentation';
import { formatTime } from '@/utils/formats';
import { Clock } from 'lucide-react-native';
import { View } from 'react-native';

type MatchHeroScoreProps = {
  homeScore: number | null;
  awayScore: number | null;
  kickOff: string;
  presentation: MatchPresentation;
};

export function MatchHeroScore({ homeScore, awayScore, kickOff, presentation }: MatchHeroScoreProps) {
  if (presentation.showKickoffTime) {
    return (
      <View className="  items-center justify-center gap-1">
        <Clock size={18} color="#9ca3af" strokeWidth={1.6} />
        <Text variant="titleLarge" className="text-gray-400">
          {formatTime(kickOff)}
        </Text>
      </View>
    );
  }

  return (
    <View className=" items-center justify-center gap-1">
      {presentation.isLive ? (
        <View className="items-center gap-1">
          <Text variant="label" className="text-center text-success">
            {presentation.detailStatusLabel}
          </Text>
          <View className="rounded-lg border border-primary px-2 py-1">
            <Text className="text-4xl font-bold text-white">
              {homeScore ?? '—'} : {awayScore ?? '—'}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-4 py-2">
          <Text className="text-3xl font-bold text-white">{homeScore ?? '—'}</Text>
          <Text className="mx-2 text-2xl text-white/70">:</Text>
          <Text className="text-3xl font-bold text-white">{awayScore ?? '—'}</Text>
        </View>
      )}
    </View>
  );
}
