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
import { CalendarDays } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AiAnalysisCardProps = {
  match: MatchDetails;
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
  return (
    <Card padding="sm" variant="elevated">
      <Row>
        <View className="min-w-0 flex-1 items-center">
          <Text variant="subtitle" numberOfLines={2} className="text-center">
            {teams.home}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text variant="title" tone="primary">
            {score.home}
          </Text>
          <Text variant="small" tone="muted" className="mx-2">
            :
          </Text>
          <Text variant="title" tone="primary">
            {score.away}
          </Text>
        </View>

        <View className="min-w-0 flex-1 items-center px-1">
          <Text variant="subtitle" numberOfLines={2} className="text-center">
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
  return (
    <View className="py-3">
      {splitSummaryParagraphs(summary).map((paragraph, index) => (
        <Text key={index} className="text-start leading-7">
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

function AiSummaryCard({ summary, isPro, theme }: AiSummaryCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Card padding="md" variant="elevated">
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
              <Text variant="small" tone="muted" className="text-center">
                {t('Get the full breakdown behind every prediction.')}
              </Text>
            </View>
            <Button label={t('Upgrade to Pro')} onPress={() => router.push('/(app)/(user)/settings')} />
          </View>
        </BlurView>
      )}
    </Card>
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
    <Card variant="elevated" padding="lg" contentClassName="min-h-72 items-center gap-4">
      <CalendarDays size={64} strokeWidth={1.5} color={colors.primary} />

      <Text variant="title" className="text-center">
        {t('AI analysis is available on match day')}
      </Text>
      <Text variant="small" tone="muted" className="text-center pt-3">
        {t('To provide the most relevant analysis, AI analyzes unlocked only on the day of the match.')}
      </Text>
    </Card>
  );
}

export default function AiAnalysisCard({ match }: AiAnalysisCardProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const language = useLanguageStore((s) => s.language);
  const analysis = resolveAiAnalysis(match);
  const bottomInset = useSafeAreaInsets();
  const { theme } = useThemeTokens();
  const subscriptionAccess = useSubscriptionAccess();
  const isPro = subscriptionAccess.data?.planCode === 'pro';
  const { data: aiSummary } = useMatchAiSummary(match.id, isPro && analysis.status === 'available');

  const summary = resolveAiSummaryText(aiSummary, language);
  const isAvailable = analysis.status === 'available';

  const teams = {
    home: teamName(match.home_team, t('Home')),
    away: teamName(match.away_team, t('Away')),
  };

  return (
    <View className="flex-1  border-r border-l border-border" style={{ paddingBottom: bottomInset.bottom }}>
      <View className="flex-row  justify-center py-3 gap-2">
        <Ionicons name="sparkles" size={20} color={colors.primary} />
        <Text variant="titleLarge" tone="primary" className="font-bold">
          {t('AI Analysis')}
        </Text>
      </View>

      <Divider className="bg-primary" />
      <View className="flex-1 p-5 gap-4">
        {isAvailable ? (
          <>
            <AiScoreCard teams={teams} score={analysis.score} />
            <AiSummaryCard summary={summary} isPro={isPro} theme={theme} />
          </>
        ) : (
          <AiUnavailableState />
        )}
        <View className="mt-auto">
          <AiDisclaimer />
        </View>
      </View>
    </View>
  );
}
