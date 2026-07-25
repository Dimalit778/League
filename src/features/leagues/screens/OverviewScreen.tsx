import { Screen } from '@/components/layout';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeagueSkeleton from '../components/overview/LeagueSkeleton';
import LeagueSummary from '../components/overview/LeagueSummary';
import { QuickAccessSection } from '../components/overview/QuickAccessSection';
import { UpcomingMatches } from '../components/overview/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, upcomingMatches, isLoading } = useLeagueOverview();
  const { bottom } = useSafeAreaInsets();

  if (isLoading) return <LeagueSkeleton />;

  return (
    <Screen>
      <LeagueSummary leagueSummary={leagueSummary} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-3 pt-3"
        style={{ paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
      >
        <QuickAccessSection />
        <StatsPredictionSection stats={stats} />
        <UpcomingMatches matches={upcomingMatches} />
      </ScrollView>
    </Screen>
  );
}
