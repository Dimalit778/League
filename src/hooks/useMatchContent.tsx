import FinishContent from '@/components/matchDetails/FinishContent';
import ScheduledContent from '@/components/matchDetails/ScheduledContent';
import { FixturesWithTeamsType } from '@/types';

export const useMatchContent = (match: FixturesWithTeamsType) => {
  switch (match.status) {
    case 'scheduled':
      if (new Date(match.kickoff_time) > new Date()) {
        return <ScheduledContent match={match} />;
      }
    case 'live':
      return <FinishContent match_id={match.id} />;

    case 'finished':
      return <FinishContent match_id={match.id} />;
  }
};
