import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Clock } from 'lucide-react-native';
import { View } from 'react-native';

type MatchCardScoreProps = {
  homeScore: number | null;
  awayScore: number | null;
  time: string;
};

export function MatchCardScore({ homeScore, awayScore, time }: MatchCardScoreProps) {
  const { colors } = useThemeTokens();
  const hasScore = homeScore != null && awayScore != null;

  if (hasScore) {
    return (
      <Text variant="header" className="w-full text-center text-muted pb-3" numberOfLines={1}>
        {homeScore} - {awayScore}
      </Text>
    );
  }

  return (
    <View className="flex-row items-center justify-center gap-1.5">
      <Clock size={13} color={colors.muted} />
      <Text variant="bodySmall" tone="muted" numberOfLines={1}>
        {time}
      </Text>
    </View>
  );
}
