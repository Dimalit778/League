import { useThemeTokens } from '@/hooks/useThemeTokens';
import { dateFormat, dayNameFormat, timeFormat } from '@/utils/formats';
import { getSimpleMatchStatus } from '@/utils/matchHelper';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

type Prediction = {
  home_score: number;
  away_score: number;
  points?: number;
  is_finished?: boolean;
};

type MatchHeaderProps = {
  status: string;
  kickOff: string;
  prediction: Prediction | null;
};
const getMatchStatusColor = (
  status: string,
  prediction: Prediction | null
): [string, string] => {
  const normalizedStatus = status?.toUpperCase();
  const { colors } = useThemeTokens();

  if (
    normalizedStatus === 'FINISHED' &&
    prediction?.is_finished &&
    prediction.points !== undefined
  ) {
    const points = prediction.points;
    if (points === 5) {
      return ['#FCD34D', '#F59E0B'];
    }
    if (points === 3) {
      return ['#10B981', '#059669'];
    }
    if (points === 0) {
      return ['#6B7280', '#EF4444'];
    }
    return [colors.muted, colors.muted];
  }

  return [colors.muted, colors.muted];
};

const MatchHeader = ({ status, kickOff, prediction }: MatchHeaderProps) => {
  const matchStatus = getSimpleMatchStatus(status);
  const colors = getMatchStatusColor(matchStatus, prediction);

  return (
    <View className="bg-muted flex-row items-center justify-center px-4 ">
      <View className="flex-1 ">
        <Text className="text-background text-xs font-medium ">
          {dayNameFormat(kickOff)}
        </Text>
      </View>
      <View className="min-w-[80px] mx-3 ">
        <LinearGradient colors={colors}>
          {matchStatus === 'SCHEDULED' ? (
            <Text className="text-background text-xs font-medium text-center">
              {timeFormat(kickOff)}
            </Text>
          ) : (
            <Text className="text-background font-medium text-center">
              {prediction?.home_score ?? '-/-'} -
              {prediction?.away_score ?? '-/-'}
            </Text>
          )}
        </LinearGradient>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-background text-xs font-medium">
          {dateFormat(kickOff)}
        </Text>
      </View>
    </View>
  );
};

export default MatchHeader;
