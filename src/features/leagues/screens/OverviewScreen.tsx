import { Screen, useFloatBottomTabsInset } from '@/components/layout';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { ScrollView } from 'react-native';
import { CurrentFormCard } from '../components/overview/CurrentFormCard';
import LeagueSummary from '../components/overview/LeagueSummary';
import OverviewSkeleton from '../components/overview/OverviewSkeleton';
import { QuickAccessSection } from '../components/overview/QuickAccessSection';
import { UpcomingMatches } from '../components/overview/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, upcomingMatches, isLoading } = useLeagueOverview();
  const bottomTabsInset = useFloatBottomTabsInset();

  if (isLoading) return <OverviewSkeleton />;

  return (
    <Screen>
      <LeagueSummary leagueSummary={leagueSummary} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-3 pt-3"
        contentContainerStyle={{ paddingBottom: bottomTabsInset }}
        showsVerticalScrollIndicator={false}
      >
        <QuickAccessSection />
        <CurrentFormCard results={stats.recentForm} />
        <StatsPredictionSection stats={stats} />
        <UpcomingMatches matches={upcomingMatches} />
      </ScrollView>
    </Screen>
  );
}
