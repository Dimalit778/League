import AiAnalysisCard from '@/features/matches/components/match-details/AiAnalysisCard';
import { MatchDetails } from '@/features/matches/types';
import MatchDetailsTabs from './MatchDetailsTabs';

interface MatchContentProps {
  match: MatchDetails;
  canPredict: boolean;
}

export default function MatchContent({ match, canPredict }: MatchContentProps) {
  if (canPredict) {
    return <AiAnalysisCard match={match} />;
  }

  return <MatchDetailsTabs match={match} />;
}
