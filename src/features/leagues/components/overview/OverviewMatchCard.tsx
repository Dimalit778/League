import { Card, Divider, TeamLogo, Text } from '@/components';
import { deriveMatchPresentation } from '@/features/matches/model/matchPresentation';
import type { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { CirclePlus } from 'lucide-react-native';
import { View } from 'react-native';

type OverviewMatchCardProps = {
  match: MatchCardData;
  onPress?: () => void;
};

function Top({ match }: { match: MatchCardData }) {
  const hasPrediction = match.prediction?.home != null && match.prediction.away != null;
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const tone =
    match.predictionStatus === 'correct' ? 'success' : match.predictionStatus === 'incorrect' ? 'error' : 'info';

  return (
    <View className="flex-row items-center justify-between px-1">
      <Text variant="caption" tone="muted" className="font-semibold" numberOfLines={1}>
        {match.date}
      </Text>
      {hasPrediction ? (
        <Text variant="label" tone={tone} numberOfLines={1}>
          {`${match.prediction?.home}-${match.prediction?.away}`}
        </Text>
      ) : (
        <View className="flex-row items-center gap-1">
          <CirclePlus size={15} color={colors.info} strokeWidth={1.8} />
          <Text variant="caption" tone="info" numberOfLines={1}>
            {t('No prediction')}
          </Text>
        </View>
      )}
    </View>
  );
}

function MatchCenter({ match, showScore, isFinished }: { match: MatchCardData; showScore: boolean; isFinished: boolean }) {
  if (showScore) {
    return (
      <View className=" flex-row items-center justify-center gap-1.5">
        <Text className="text-xl font-semibold">{match.home.score}</Text>
        <View className="h-7 w-px bg-border" />
        <Text className="text-xl font-semibold">{match.away.score}</Text>
      </View>
    );
  }

  return (
    <Text variant="label" className=" text-center" numberOfLines={1}>
      {isFinished ? 'FT' : match.time}
    </Text>
  );
}

export function OverviewMatchCard({ match, onPress }: OverviewMatchCardProps) {
  const presentation = deriveMatchPresentation({ status: match.status, kickOff: match.kickOff });
  const showScore = match.home.score != null && match.away.score != null && presentation.scoreMode === 'score';

  return (
    <Card onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${match.id}`))} variant="elevated" padding="sm">
      <View className="gap-1.5">
        <Top match={match} />
        <Divider />

        <View className="flex-row items-center justify-around">
          <TeamLogo tla={match.home.tla} clubColors={match.home.clubColors} size={36} shape="circle" />
          <MatchCenter match={match} showScore={showScore} isFinished={presentation.isFinished} />
          <TeamLogo tla={match.away.tla} clubColors={match.away.clubColors} size={36} shape="circle" />
        </View>
      </View>
    </Card>
  );
}
