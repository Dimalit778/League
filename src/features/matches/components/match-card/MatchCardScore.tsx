import { Text } from '@/components';
import type { MatchUiScore } from '@/features/matches/model/matchPresentation';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Clock } from 'lucide-react-native';
import { View } from 'react-native';

export function MatchCardScore({ score }: { score: MatchUiScore }) {
  const { colors } = useThemeTokens();

  if (score.kind === 'score') {
    return (
      <Text variant="heading" size="3xl" tone={score.tone} className="w-full text-center " numberOfLines={1}>
        {score.home} - {score.away}
      </Text>
    );
  }

  if (score.kind === 'empty') {
    return (
      <Text variant="heading" size="3xl" tone="muted" className="w-full text-center pb-3" numberOfLines={1}>
        – - –
      </Text>
    );
  }

  return (
    <View className="flex-row items-center justify-center gap-1.5">
      <Clock size={13} color={colors.muted} />
      <Text size="sm" tone="muted">
        {score.time}
      </Text>
    </View>
  );
}
