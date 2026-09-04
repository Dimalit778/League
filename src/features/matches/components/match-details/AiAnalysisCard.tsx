import { Button, Card, Row, TeamLogo, Text } from '@/components';
import { useMatchAiSummary } from '@/features/matches/hooks/useMatchData';
import { resolveAiAnalysis, resolveAiSummaryText, splitSummaryParagraphs } from '@/features/matches/model/aiAnalysis';
import { MatchDetails, TeamType } from '@/features/matches/types';
import { useSubscriptionAccess } from '@/features/subscription/hooks/useSubscriptionAccess';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { setColorAlpha } from '@/lib/color';
import { spacing } from '@/lib/nativewind/spacing';
import { useLanguageStore } from '@/store/LanguageStore';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Bot, BrainCircuit, CalendarDays } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

type AiAnalysisCardProps = {
  match: MatchDetails;
  title?: string;
};

type AiAnalysisPanelProps = {
  homeTeam: TeamType | null;
  awayTeam: TeamType | null;
  teams: { home: string; away: string };
  score: { home: number; away: number };
  summary: string;
  isPro: boolean;
  theme: 'light' | 'dark';
  updatedLabel?: string;
};

function teamName(team: TeamType | null, fallback: string) {
  return team?.shortName ?? team?.name ?? fallback;
}

function AiLockedSummaryPlaceholder() {
  return (
    <View className="gap-3 py-2" accessible={false} importantForAccessibility="no-hide-descendants">
      <View className="h-4 w-full rounded-full bg-muted/25" />
      <View className="h-4 w-11/12 rounded-full bg-muted/25" />
      <View className="h-4 w-4/5 rounded-full bg-muted/25" />
      <View className="h-4 w-full rounded-full bg-muted/25" />
      <View className="h-4 w-2/3 rounded-full bg-muted/25" />
      <View className="h-4 w-5/6 rounded-full bg-muted/25" />
    </View>
  );
}

function AiTeamColumn({ team, name }: { team: TeamType | null; name: string }) {
  return (
    <View className="items-center gap-2" style={{ width: 88 }}>
      <TeamLogo tla={team?.tla} clubColors={team?.clubColors} size={46} />
      <Text size="sm" weight="semibold" numberOfLines={1} className="text-center">
        {name}
      </Text>
    </View>
  );
}

function AiScoreBlock({
  homeTeam,
  awayTeam,
  teams,
  score,
}: Pick<AiAnalysisPanelProps, 'homeTeam' | 'awayTeam' | 'teams' | 'score'>) {
  return (
    <Card padding="sm" variant="surface" contentClassName="items-center gap-4">
      <Row keepLtr className="w-full items-center justify-around">
        <AiTeamColumn team={homeTeam} name={teams.home} />

        <Row keepLtr className="items-center gap-2">
          <Text weight="sportBold" size="4xl" tone="primary">
            {score.home}
          </Text>
          <Text size="3xl" tone="muted">
            :
          </Text>
          <Text weight="sportBold" size="4xl" tone="primary">
            {score.away}
          </Text>
        </Row>

        <AiTeamColumn team={awayTeam} name={teams.away} />
      </Row>
    </Card>
  );
}

function AiSummaryBody({ summary }: { summary: string }) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <Text variant="title" size="lg" className="text-center">
        {t('Summary')}
      </Text>

      <View className="gap-3">
        {splitSummaryParagraphs(summary).map((paragraph) => (
          <Text key={paragraph} variant="body" tone="muted" className="text-start leading-8">
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
}

function AiLockedSummary({ theme }: { theme: 'light' | 'dark' }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="relative min-h-52 overflow-hidden">
      <AiLockedSummaryPlaceholder />
      <BlurView intensity={30} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <View className="flex-1 items-center justify-center gap-3 px-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary">
            <Feather name="lock" size={22} color={colors.primary} />
          </View>
          <View className={spacing.inline}>
            <Text variant="body" weight="semibold" className="text-center">
              {t('Unlock the full AI analysis with Pro')}
            </Text>
            <Text variant="body" size="sm" tone="muted" className="text-center">
              {t('Get the full breakdown behind every prediction.')}
            </Text>
          </View>
          <Button label={t('Upgrade to Pro')} onPress={() => router.push('/(app)/(user)/settings')} />
        </View>
      </BlurView>
    </View>
  );
}

function AiAnalysisTitle() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Row between className="items-center">
      <Row className="items-center gap-3">
        <View
          className="items-center justify-center rounded-2xl"
          style={{
            width: 46,
            height: 46,
            backgroundColor: setColorAlpha(colors.primary, 0.14),
            borderWidth: 1,
            borderColor: setColorAlpha(colors.primary, 0.28),
          }}
        >
          <Bot size={26} strokeWidth={1.75} color={colors.primary} />
        </View>

        <View>
          <Text variant="title" size="lg">
            {t('AI Match Analysis')}
          </Text>
          <Text variant="caption" tone="muted">
            {`${t('Score Prediction')} • ${t('Match Summary')}`}
          </Text>
        </View>
      </Row>
    </Row>
  );
}

function AiAnalysisPanel({
  homeTeam,
  awayTeam,
  teams,
  score,
  summary,
  isPro,
  theme,
  updatedLabel,
}: AiAnalysisPanelProps) {
  return (
    <Card padding="md" variant="soft" contentClassName="gap-6">
      <AiAnalysisTitle />
      <AiScoreBlock homeTeam={homeTeam} awayTeam={awayTeam} teams={teams} score={score} />
      {isPro ? <AiSummaryBody summary={summary} /> : <AiLockedSummary theme={theme} />}
    </Card>
  );
}

function AiDisclaimer() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Card padding="sm" variant="outline">
      <Row className="items-center gap-3 px-1">
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.muted} />
        <Text variant="caption" tone="muted" className="min-w-0 flex-1">
          {t('AI-generated analysis for entertainment only. It may be inaccurate and is not betting advice.')}
        </Text>
      </Row>
    </Card>
  );
}

function AiUnavailableState() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Card padding="lg" contentClassName="items-center gap-4">
      <CalendarDays size={64} strokeWidth={1.5} color={colors.muted} />
      <Text variant="title" className="text-center">
        {t('Available on match day')}
      </Text>
      <Text variant="body" size="sm" tone="muted" className="text-center">
        {t('AI analysis will appear here on the day of the match.')}
      </Text>
    </Card>
  );
}

export default function AiAnalysisCard({ match, title }: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const { colors, theme } = useThemeTokens();
  const language = useLanguageStore((s) => s.language);
  const analysis = resolveAiAnalysis(match);
  const subscriptionAccess = useSubscriptionAccess();
  const isPro = subscriptionAccess.data?.planCode === 'pro';
  const summaryQuery = useMatchAiSummary(match.id, isPro && analysis.status === 'available');
  const summary = resolveAiSummaryText(summaryQuery.data, language);
  const isLoadingSummary = isPro && analysis.status === 'available' && summaryQuery.isPending;
  const hasSummary = !isPro || summary.length > 0;
  const teams = {
    home: teamName(match.home_team, t('Home')),
    away: teamName(match.away_team, t('Away')),
  };

  return (
    <View className="flex-1  ">
      {title ? (
        <View className="h-12 flex-row items-center justify-center gap-2 border-b-2 border-border">
          <BrainCircuit size={20} color={colors.primary} />
          <Text variant="title" tone="primary" size="2xl">
            {title}
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, gap: 16, paddingVertical: 24 }}
      >
        {isLoadingSummary ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : analysis.status === 'available' && hasSummary ? (
          <AiAnalysisPanel
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            teams={teams}
            score={analysis.score}
            summary={summary}
            isPro={isPro}
            theme={theme}
          />
        ) : (
          <View className="gap-4">
            <AiUnavailableState />
            {summaryQuery.error && isPro ? (
              <Button
                label={t('Try again')}
                onPress={() => void summaryQuery.refetch()}
                loading={summaryQuery.isFetching}
              />
            ) : null}
          </View>
        )}
        <View className="mt-auto">
          <AiDisclaimer />
        </View>
      </ScrollView>
    </View>
  );
}
