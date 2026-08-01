import { Row, Screen } from '@/components/layout';
import { Badge, Button, Card, Divider, Text } from '@/components/ui';
import { MatchWithPredictions, TeamType } from '@/features/matches/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import type { ThemeName } from '@/lib/nativewind/nativeWind';
import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { useLanguageStore } from '@/store/LanguageStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

type AiAnalysisCardProps = {
  match: MatchWithPredictions;
};

type AiScoreCardProps = {
  teams: { home: string; away: string };
  score: { home: number; away: number };
};

type AiSummaryCardProps = {
  summary: string;
  isPro: boolean;
  theme: ThemeName;
};

function teamName(team: TeamType | null, fallback: string) {
  return team?.shortName ?? team?.name ?? fallback;
}

function AiEyebrow() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Badge
      variant="primary"
      size="lg"
      label={t('AI Prediction')}
      className="self-center "
      leftIcon={<Ionicons name="sparkles" size={13} color={colors.primary} />}
    />
  );
}

function AiScoreCard({ teams, score }: AiScoreCardProps) {
  return (
    <Card variant="default" padding="sm" className="overflow-hidden ">
      <Row>
        <View className="min-w-0 flex-1 items-center">
          <Text variant="bodySmall" numberOfLines={2} className="text-center">
            {teams.home}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text variant="title" tone="primary">
            {score.home}
          </Text>
          <Text variant="bodySmall" tone="muted" className="mx-2">
            :
          </Text>
          <Text variant="title" tone="primary">
            {score.away}
          </Text>
        </View>

        <View className="min-w-0 flex-1 items-center px-1">
          <Text variant="bodySmall" numberOfLines={2} className="text-center">
            {teams.away}
          </Text>
        </View>
      </Row>
    </Card>
  );
}

function AiSummaryCard({ summary, isPro, theme }: AiSummaryCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View>
      <Row className="items-center justify-center gap-2">
        <Ionicons name="analytics" size={18} color={colors.primary} />

        <Text variant="subtitle" className="font-semibold">
          {t('AI match analysis')}
        </Text>
      </Row>

      <View className="px-4 py-4">
        <Text variant="body" className="leading-7 text-text">
          {summary}
        </Text>
      </View>

      {!isPro && (
        <BlurView intensity={24} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
          <View className="flex-1 items-center justify-center gap-3 px-6 py-8">
            <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
              <Feather name="lock" size={22} color={colors.primary} />
            </View>
            <View className="gap-1">
              <Text variant="body" className="text-center font-semibold">
                {t('Unlock the full AI analysis with Pro')}
              </Text>
              <Text variant="bodySmall" tone="muted" className="text-center">
                {t('Get the full breakdown behind every prediction.')}
              </Text>
            </View>
            <Button label={t('Upgrade to Pro')} onPress={() => router.push('/(app)/(user)/settings')} fullWidth />
          </View>
        </BlurView>
      )}
    </View>
  );
}

function AiDisclaimer() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Row className="items-center justify-center gap-3">
      <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
      <Text variant="caption" tone="muted">
        {t('AI-generated preview based on available match data.')}
      </Text>
    </Row>
  );
}

export default function AiAnalysisCard({ match }: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const summary =
    language === 'he'
      ? (match.ai_summary_he ?? match.ai_summary_en ?? '')
      : (match.ai_summary_en ?? match.ai_summary_he ?? '');
  const { theme } = useThemeTokens();
  const { subscription } = useRevenueCatSubscription();
  const isPro = subscription.isActive;

  const teams = {
    home: teamName(match.home_team, t('Home')),
    away: teamName(match.away_team, t('Away')),
  };

  const score = {
    home: match.ai_predicted_home_score ?? 0,
    away: match.ai_predicted_away_score ?? 0,
  };

  return (
    <Screen padding="all" contentClassName="flex-1 justify-between">
      <View className="gap-5">
        <AiEyebrow />
        <Divider />
        <AiScoreCard teams={teams} score={score} />
        <AiSummaryCard summary={summary} isPro={isPro} theme={theme} />
      </View>
      <AiDisclaimer />
    </Screen>
  );
}
