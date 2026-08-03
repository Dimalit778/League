import { Screen, Section, useFloatBottomTabsInset } from '@/components/layout';
import { DirectionalIcon } from '@/components/ui';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { CurrentFormCard } from '../components/overview/CurrentFormCard';
import LeagueSummary from '../components/overview/LeagueSummary';
import OverviewSkeleton from '../components/overview/OverviewSkeleton';
import { UpcomingMatches } from '../components/overview/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, upcomingMatches, isLoading } = useLeagueOverview();
  const bottomTabsInset = useFloatBottomTabsInset();
  const memberId = useMemberId();
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  if (isLoading) return <OverviewSkeleton />;

  return (
    <Screen scroll padding="all" bottomInset={bottomTabsInset} contentClassName={spacing.section}>
      <LeagueSummary leagueSummary={leagueSummary} />

      <Section title={t('Current form')}>
        <CurrentFormCard results={stats.recentForm} />
      </Section>
      <Section
        title={t('Stats')}
        actionIcon={<DirectionalIcon size={20} color={colors.text} />}
        onActionPress={() => {
          if (!memberId) return;
          router.push({
            pathname: '/(app)/(league)/member/[memberId]',
            params: { memberId },
          });
        }}
      >
        <StatsPredictionSection stats={stats} />
      </Section>

      <Section title={t('Today matches')}>
        <UpcomingMatches matches={upcomingMatches} />
      </Section>
    </Screen>
  );
}
