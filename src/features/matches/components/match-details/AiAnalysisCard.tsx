import { Button, Card, Divider, Row, Text } from '@/components';
import { useMatchAiSummary } from '@/features/matches/hooks/useMatchData';
import { resolveAiAnalysis, resolveAiSummaryText, splitSummaryParagraphs } from '@/features/matches/model/aiAnalysis';
import { MatchDetails, TeamType } from '@/features/matches/types';
import { useSubscriptionAccess } from '@/features/subscription/hooks/useSubscriptionAccess';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/LanguageStore';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { BrainCircuit, CalendarDays, ClipboardList, Crosshair } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AiAnalysisCardProps = {
  match: MatchDetails;
  title?: string;
};

type AiScoreCardProps = {
  teams: { home: string; away: string };
  score: { home: number; away: number };
};

type AiSummaryCardProps = {
  summary: string;
  isPro: boolean;
  theme: 'light' | 'dark';
};

function teamName(team: TeamType | null, fallback: string) {
  return team?.shortName ?? team?.name ?? fallback;
}

function AiScoreCard({ teams, score }: AiScoreCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  return (
    <Card padding="sm">
      <Row className="items-center justify-center gap-2">
        <Crosshair size={20} color={colors.muted} />
        <Text variant="title" tone="muted" weight="bold">
          {t('Score')}
        </Text>
      </Row>
      <Divider className="my-2" />
      <Row keepLtr>
        <View className="min-w-0 flex-1 items-center">
          <Text variant="title" size="lg" numberOfLines={2} className="text-center">
            {teams.home}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text variant="title" tone="primary">
            {score.home}
          </Text>
          <Text variant="body" size="sm" tone="muted" className="mx-2">
            :
          </Text>
          <Text variant="title" tone="primary">
            {score.away}
          </Text>
        </View>

        <View className="min-w-0 flex-1 items-center px-1">
          <Text variant="title" size="lg" numberOfLines={2} className="text-center">
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

function AiSummaryText({ summary }: { summary: string }) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  return (
    <Card padding="sm">
      <Row className="items-center justify-center gap-2">
        <ClipboardList size={20} color={colors.muted} />
        <Text variant="title" tone="muted" weight="bold">
          {t('Al Summary')}
        </Text>
      </Row>
      <Divider className="my-2" />
      <View className="mx-2">
        {splitSummaryParagraphs(summary).map((paragraph) => (
          <Text key={paragraph} className="text-start leading-8">
            {paragraph}
          </Text>
        ))}
      </View>
    </Card>
  );
}

function AiSummaryCard({ summary, isPro, theme }: AiSummaryCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <>
      {isPro ? <AiSummaryText summary={summary} /> : <AiLockedSummaryPlaceholder />}

      {!isPro && (
        <BlurView intensity={30} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
          <View className="flex-1 items-center justify-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary">
              <Feather name="lock" size={22} color={colors.primary} />
            </View>
            <View className="gap-1">
              <Text variant="body" className="text-center font-semibold">
                {t('Unlock the full AI analysis with Pro')}
              </Text>
              <Text variant="body" size="sm" tone="muted" className="text-center">
                {t('Get the full breakdown behind every prediction.')}
              </Text>
            </View>
            <Button label={t('Upgrade to Pro')} onPress={() => router.push('/(app)/(user)/settings')} />
          </View>
        </BlurView>
      )}
    </>
  );
}

function AiDisclaimer() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Card padding="sm" variant="soft">
      <Row className="items-center gap-4 px-2">
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.muted} />
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
    <Card padding="lg" contentClassName="min-h-72 items-center gap-4">
      <CalendarDays size={64} strokeWidth={1.5} color={colors.primary} />

      <Text variant="title" className="text-center">
        {t('Available on match day')}
      </Text>
      <Text variant="body" size="sm" tone="muted" className="text-center pt-3">
        {t('AI analysis will appear here on the day of the match.')}
      </Text>
    </Card>
  );
}

export default function AiAnalysisCard({ match, title }: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const language = useLanguageStore((s) => s.language);
  const analysis = resolveAiAnalysis(match);
  const bottomInset = useSafeAreaInsets();
  const { theme } = useThemeTokens();
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
    <View className="flex-1  border-r border-l border-border" style={{ paddingBottom: bottomInset.bottom }}>
      {title && (
        <View className="flex-row  justify-center py-3 gap-2 border-b border-primary">
          <BrainCircuit size={20} color={colors.primary} />
          <Text variant="heading" size="2xl" tone="primary" className="font-bold">
            {title}
          </Text>
        </View>
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 16 }}>
        {isLoadingSummary ? (
          <Text className="py-8 text-center" accessibilityLiveRegion="polite">
            {t('Loading')}
          </Text>
        ) : analysis.status === 'available' && hasSummary ? (
          <>
            <AiScoreCard teams={teams} score={analysis.score} />
            <AiSummaryCard summary={summary} isPro={isPro} theme={theme} />
            <Text variant="caption" tone="muted" className="text-center">
              {t('Updated {{date}}', {
                date: analysis.generatedAt.toLocaleString(language === 'he' ? 'he-IL' : 'en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }),
              })}
            </Text>
          </>
        ) : (
          <View className="gap-4">
            <AiUnavailableState />
            {summaryQuery.error && isPro && (
              <Button
                label={t('Try again')}
                onPress={() => void summaryQuery.refetch()}
                loading={summaryQuery.isFetching}
              />
            )}
          </View>
        )}
        <View className="mt-auto">
          <AiDisclaimer />
        </View>
      </ScrollView>
    </View>
  );
}
