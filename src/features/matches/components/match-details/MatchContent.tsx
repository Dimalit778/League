import AiAnalysisCard from '@/features/matches/components/match-details/AiAnalysisCard';
import { MatchWithPredictions } from '@/features/matches/types';
import TabsContent from './TabsContent';

interface MatchContentProps {
  match: MatchWithPredictions;
  isScheduled: boolean;
}

export default function MatchContent({ match, isScheduled }: MatchContentProps) {
  if (isScheduled) {
    if (match.ai_summary_en && match.ai_summary_he) {
      return (
        <AiAnalysisCard
          summaryEn={match.ai_summary_en}
          summaryHe={match.ai_summary_he}
          predictedHomeScore={match.ai_predicted_home_score ?? 0}
          predictedAwayScore={match.ai_predicted_away_score ?? 0}
          homeTeamName={match.home_team?.shortName ?? match.home_team?.name ?? 'Home'}
          awayTeamName={match.away_team?.shortName ?? match.away_team?.name ?? 'Away'}
        />
      );
    }
  }

  const predictions = match.predictions ?? [];
  return <TabsContent predictions={predictions} />;
}
