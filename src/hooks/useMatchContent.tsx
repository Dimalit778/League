import FinishContent from '@/components/matchDetails/FinishContent';
import LiveContent from '@/components/matchDetails/LiveContent';
import ScheduledContent from '@/components/matchDetails/ScheduledContent';
import { FixturesWithTeams } from '@/types';

export const useMatchContent = (match: FixturesWithTeams) => {
  switch (match.status) {
    case 'scheduled':
      return <ScheduledContent match={match} />;
    case 'live':
      return <LiveContent match={match} />;
    case 'finished':
      return <FinishContent match={match} />;
  }
};
