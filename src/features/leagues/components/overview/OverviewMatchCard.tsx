import { Card, Divider, TeamLogo, Text } from '@/components';
import { deriveCardPresentation } from '@/features/matches/model/matchPresentation';
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

export function OverviewMatchCard({ match, onPress }: OverviewMatchCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const presentation = deriveCardPresentation(match);
  const { status, score, prediction } = presentation;

  return (
    <Card onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${match.id}`))} variant="elevated" padding="sm">
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between px-1">
          <Text variant="caption" tone={status.tone} className="font-medium" numberOfLines={1}>
            {status.label}
          </Text>

          {prediction.kind === 'value' ? (
            <Text variant="label" tone={prediction.tone} ltr numberOfLines={1}>
              {prediction.text}
            </Text>
          ) : prediction.kind === 'plus' ? (
            <View accessibilityLabel={t('No prediction')}>
              <CirclePlus size={16} color={colors.info} strokeWidth={1.8} />
            </View>
          ) : (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              –
            </Text>
          )}
        </View>
        <Divider />

        <View className="flex-row items-center justify-around">
          <TeamLogo tla={match.home.tla} clubColors={match.home.clubColors} size={36} shape="circle" />
          {score.kind === 'score' ? (
            <View className="flex-row items-center justify-center gap-1.5">
              <Text tone={score.tone} weight="sportBold" size="xl">
                {score.home}
              </Text>
              <View className="h-7 w-px bg-border" />
              <Text tone={score.tone} weight="sportBold" size="xl">
                {score.away}
              </Text>
            </View>
          ) : score.kind === 'time' ? (
            <Text variant="label" className="text-center" numberOfLines={1}>
              {score.time}
            </Text>
          ) : null}
          <TeamLogo tla={match.away.tla} clubColors={match.away.clubColors} size={36} shape="circle" />
        </View>
      </View>
    </Card>
  );
}
