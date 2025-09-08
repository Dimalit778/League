import { dateFormat, timeFormatTimezone } from '@/utils/formats';
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
        <View className="flex-col items-center justify-center rounded-md border border-border py-1">
          <Text className="text-muted text-xs">{dateFormat(kickOffTime)}</Text>
          <Text className="text-text">{timeFormatTimezone(kickOffTime)}</Text>
        </View>
      )}

      {status === 'live' && (
        <View className="flex-col items-center justify-center py-2">
          <Text className="text-green-500 text-sm">LIVE</Text>
          <View className="flex-row items-center justify-center">
            <Text className="text-text">{homeScore ?? 0}</Text>
            <Text className="text-text">-</Text>
            <Text className="text-text">{awayScore ?? 0}</Text>
          </View>
        </View>
      )}

      {status === 'finished' && (
        <View className="flex-row justify-center py-2">
          <Text className="text-xl font-bold text-text ">{homeScore ?? 0}</Text>
          <Text className="text-xl font-bold text-text mx-1">-</Text>
          <Text className="text-xl font-bold text-text">{awayScore ?? 0}</Text>
        </View>
      )}
    </View>
  );
};
