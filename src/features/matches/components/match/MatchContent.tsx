import { MatchWithPredictions } from '@/features/matches/types';
import PredictionForm from '@/features/predictions/components/PredictionForm';
import { useMemberStore } from '@/store/MemberStore';
import TabsContent from './TabsContent';

interface MatchContentProps {
  match: MatchWithPredictions;
}

type MatchStatus = 'SCHEDULED' | 'LIVE' | 'TIMED' | 'IN_PLAY' | 'FINISHED';

export default function MatchContent({ match }: MatchContentProps) {
  const memberId = useMemberStore((state) => state.memberId) ?? '';
  const status = (match.status ?? 'SCHEDULED') as MatchStatus;

  const now = new Date();
  const kickOff = new Date(match.kick_off);

  const isScheduled = ['SCHEDULED', 'TIMED'].includes(status) && kickOff > now;

  const predictions = match.predictions ?? [];
  const memberPrediction = predictions.find((prediction) => prediction.league_member?.id === memberId);

  if (isScheduled) {
    return <PredictionForm prediction={memberPrediction} matchId={match.id} />;
  }
  return <TabsContent predictions={predictions} />;
}
