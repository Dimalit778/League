import AiAnalysisCard from '@/features/matches/components/match-details/AiAnalysisCard';
import { MatchWithPredictions } from '@/features/matches/types';
import TabsContent from './TabsContent';

interface MatchContentProps {
  match: MatchWithPredictions;
  isScheduled: boolean;
}

export default function MatchContent({ match, isScheduled }: MatchContentProps) {
  if (isScheduled) {
    return <AiAnalysisCard match={match} />;
  }

  const predictions = match.predictions ?? [];
  return <TabsContent predictions={predictions} />;
}
