import { dateFormat, timeFormat } from '@/utils/formats';
import { Text, View } from 'react-native';

export const MatchStatus = ({
  status,
  homeScore,
  awayScore,
  kickOffTime,
}: {
  status: string;
  homeScore: number;
  awayScore: number;
  kickOffTime: string;
}) => {
  return (
    <View className="min-w-[70px] h-[40px] items-center justify-center">
      {status === 'scheduled' && (
        <View className="flex-col items-center justify-center rounded-md border border-border px-2 py-1">
          <Text className="text-sm font-bold text-text">
            {dateFormat(kickOffTime)}
          </Text>
          <Text className="text-xs font-bold text-textMuted">
            {timeFormat(kickOffTime)}
          </Text>
        </View>
      )}

      {status === 'live' && (
        <View className="flex-col items-center justify-center">
          <Text className="text-xs font-bold text-green-500 mb-1">LIVE</Text>
          <View className="flex-row items-center justify-center">
            <Text className="text-xs font-bold text-text">
              {homeScore ?? 0}
            </Text>
            <Text className="text-xs font-bold text-text"> - </Text>
            <Text className="text-sm font-bold text-text">
              {awayScore ?? 0}
            </Text>
          </View>
        </View>
      )}

      {status === 'finished' && (
        <View className="flex-row items-center justify-center bg-border rounded-md px-2 py-1">
          <Text className="text-lg font-bold text-textMuted ">
            {homeScore ?? 0}
          </Text>
          <Text className="text-lg font-bold text-textMuted mx-1">-</Text>
          <Text className="text-lg font-bold text-textMuted">
            {awayScore ?? 0}
          </Text>
        </View>
      )}
    </View>
  );
};
