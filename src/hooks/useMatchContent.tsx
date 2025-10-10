import FinishContent from '@/components/matchDetails/FinishContent';
import ScheduledContent from '@/components/matchDetails/ScheduledContent';
import { MatchesWithTeamsType } from '@/types';

export const useMatchContent = (match: MatchesWithTeamsType) => {
  switch (match.status) {
    case 'scheduled':
      if (new Date(match.kick_off) > new Date()) {
        return <ScheduledContent match={match} />;
      }
    case 'live':
      return <FinishContent match_id={match.id} />;

    case 'finished':
      return <FinishContent match_id={match.id} />;
  }
};
