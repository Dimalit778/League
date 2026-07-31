import { Screen, Section, useFloatBottomTabsInset } from '@/components/layout';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { CurrentFormCard } from '../components/overview/CurrentFormCard';
import LeagueSummary from '../components/overview/LeagueSummary';
import OverviewSkeleton from '../components/overview/OverviewSkeleton';
import { UpcomingMatches } from '../components/overview/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, upcomingMatches, isLoading } = useLeagueOverview();
  const bottomTabsInset = useFloatBottomTabsInset();
  const { t } = useTranslation();

  if (isLoading) return <OverviewSkeleton />;

  return (
    <Screen
      scroll
      padding="horizontal"
      bottomInset={bottomTabsInset + 16}
      contentClassName={cn(spacing.section, 'pt-3')}
    >
      <LeagueSummary leagueSummary={leagueSummary} />

      <Section title={t('Current form')}>
        <CurrentFormCard results={stats.recentForm} />
      </Section>
      <Section title={t('Stats')}>
        <StatsPredictionSection stats={stats} />
      </Section>

      <Section title={t('Today matches')}>
        <UpcomingMatches matches={upcomingMatches} />
      </Section>
    </Screen>
  );
}
