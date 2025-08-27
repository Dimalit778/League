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
    <View className="w-full">
      {status === 'scheduled' && (
        <View className="items-center justify-center rounded-md border border-border  py-1">
          <Text className="text-xs font-thin text-muted">
            {dateFormat(kickOffTime)}
          </Text>
          <Text className="text-text">{timeFormat(kickOffTime)}</Text>
        </View>
      )}

      {status === 'live' && (
        <View className="flex-col items-center justify-center">
          <Text className="text-green-500">LIVE</Text>
          <View className="flex-row items-center justify-center">
            <Text className="text-text">{homeScore ?? 0}</Text>
            <Text className="text-text">-</Text>
            <Text className="text-text">{awayScore ?? 0}</Text>
          </View>
        </View>
      )}

      {status === 'finished' && (
        <View className="flex-row justify-center bg-border rounded-md py-2">
          <Text className="text-xl font-bold text-muted ">
            {homeScore ?? 0}
          </Text>
          <Text className="text-xl font-bold text-muted mx-1">-</Text>
          <Text className="text-xl font-bold text-muted">{awayScore ?? 0}</Text>
        </View>
      )}
    </View>
  );
};
