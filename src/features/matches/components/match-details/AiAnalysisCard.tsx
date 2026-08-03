import { Row } from '@/components/layout';
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

export type AiAnalysisState =
  | { status: 'unavailable' }
  | {
      status: 'available';
      summary: string;
      score: { home: number; away: number };
      generatedAt: Date;
    };

const isValidPredictedScore = (value: number | null): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 20;

export function resolveAiAnalysis(match: MatchWithPredictions, language: 'en' | 'he'): AiAnalysisState {
  const summary =
    language === 'he'
      ? (match.ai_summary_he ?? match.ai_summary_en ?? '').trim()
      : (match.ai_summary_en ?? match.ai_summary_he ?? '').trim();
  const generatedAt = match.ai_generated_at ? new Date(match.ai_generated_at) : null;

  if (
    !summary ||
    !isValidPredictedScore(match.ai_predicted_home_score) ||
    !isValidPredictedScore(match.ai_predicted_away_score) ||
    !generatedAt ||
    Number.isNaN(generatedAt.getTime())
  ) {
    return { status: 'unavailable' };
  }

  return {
    status: 'available',
    summary,
    score: {
      home: match.ai_predicted_home_score,
      away: match.ai_predicted_away_score,
    },
    generatedAt,
  };
}

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
  const { t } = useTranslation();

  return (
    <Card
      variant="default"
      padding="sm"
      className="overflow-hidden"
      accessible
      accessibilityLabel={t('AI prediction: {{home}} {{homeScore}}, {{away}} {{awayScore}}', {
        home: teams.home,
        homeScore: score.home,
        away: teams.away,
        awayScore: score.away,
      })}
    >
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

function AiLockedSummaryPlaceholder() {
  return (
    <View className="gap-3" accessible={false} importantForAccessibility="no-hide-descendants">
      <View className="h-4 w-full rounded-full bg-muted/25" />
      <View className="h-4 w-11/12 rounded-full bg-muted/25" />
      <View className="h-4 w-4/5 rounded-full bg-muted/25" />
      <View className="h-4 w-full rounded-full bg-muted/25" />
      <View className="h-4 w-2/3 rounded-full bg-muted/25" />
    </View>
  );
}

function AiSummaryCard({ summary, isPro, theme }: AiSummaryCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="relative min-h-72 overflow-hidden rounded-2xl border border-border bg-surface p-3">
      <Row className="items-center justify-center gap-2">
        <Ionicons name="analytics" size={18} color={colors.primary} />
        <Text variant="subtitle" className="font-semibold">
          {t('AI match analysis')}
        </Text>
      </Row>

      <View className="px-4 py-4 ">
        {isPro ? (
          <Text variant="body" className="leading-7 text-text">
            {summary}
          </Text>
        ) : (
          <AiLockedSummaryPlaceholder />
        )}
      </View>

      {!isPro && (
        <BlurView intensity={30} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
          <View className="flex-1 items-center justify-center gap-3 px-6 py-8">
            <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary">
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
            <Button label={t('Upgrade to Pro')} onPress={() => router.push('/(app)/(user)/settings')} />
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
    <Row className="items-start justify-center gap-1.5 px-4 pb-4" accessible accessibilityRole="text">
      <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
      <Text variant="caption" tone="muted" className="min-w-0 flex-1 text-center">
        {t('AI-generated analysis for entertainment only. It may be inaccurate and is not betting advice.')}
      </Text>
    </Row>
  );
}

function AiUnavailableState() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Card
      variant="soft"
      contentClassName="items-center gap-3 px-5 py-8"
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${t('AI analysis is not available')} ${t('There is not enough reliable match data to show a prediction yet.')}`}
    >
      <Ionicons name="analytics-outline" size={30} color={colors.muted} />
      <Text variant="title" className="text-center">
        {t('AI analysis is not available')}
      </Text>
      <Text variant="bodySmall" tone="muted" className="text-center">
        {t('There is not enough reliable match data to show a prediction yet.')}
      </Text>
    </Card>
  );
}

function AiUpdatedAt({ date, language }: { date: Date; language: 'en' | 'he' }) {
  const { t } = useTranslation();
  const formatted = new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return (
    <Text variant="caption" tone="muted" className="text-center">
      {t('Updated {{date}}', { date: formatted })}
    </Text>
  );
}

export default function AiAnalysisCard({ match }: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const analysis = resolveAiAnalysis(match, language);
  const { theme } = useThemeTokens();
  const { subscription } = useRevenueCatSubscription();
  const isPro = subscription.isActive;

  const teams = {
    home: teamName(match.home_team, t('Home')),
    away: teamName(match.away_team, t('Away')),
  };

  return (
    <View className="flex-1 ">
      <View className="py-4">
        <AiEyebrow />
      </View>
      <Divider />
      <View className="flex-1 mt-6 px-4">
        {analysis.status === 'available' ? (
          <>
            <AiScoreCard teams={teams} score={analysis.score} />
            <AiSummaryCard summary={analysis.summary} isPro={isPro} theme={theme} />
            <AiUpdatedAt date={analysis.generatedAt} language={language} />
          </>
        ) : (
          <AiUnavailableState />
        )}
      </View>
      <AiDisclaimer />
    </View>
  );
}
