import { Screen } from '@/components/layout';
import { StatsPredictionSection } from '@/features/memberStats/components/StatsPredictionSection';
import { ScrollView } from 'react-native';
import Header from '../components/Header';
import { UpcomingMatches } from '../components/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const vm = useLeagueOverview();

  return (
    <Screen>
      <Header {...vm.header} />
      <ScrollView className="flex-1">
        <StatsPredictionSection stats={vm.stats} />
        <UpcomingMatches matches={vm.upcomingMatches} />
      </ScrollView>
    </Screen>
  );
}
