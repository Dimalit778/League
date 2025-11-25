import { MatchWithPredictionsAndMemberType } from '@/features/matches/types';
import { useMemberStore } from '@/store/MemberStore';
import FinishedMatch from './Finished';
import Live from './Live';
import Schedule from './Schedule';

interface MatchContentProps {
  match: MatchWithPredictionsAndMemberType;
}

type MatchStatus = 'SCHEDULED' | 'LIVE' | 'TIMED' | 'IN_PLAY' | 'FINISHED';

export default function MatchContent({ match }: MatchContentProps) {
  const memberId = useMemberStore((state) => state.memberId);
  const status = (match.status ?? 'SCHEDULED') as MatchStatus;

  const now = new Date();
  const kickOff = new Date(match.kick_off);

  const isScheduled = ['SCHEDULED', 'TIMED'].includes(status) && kickOff > now;
  const isLive = status === 'IN_PLAY' || status === 'LIVE';

  const predictions = match.predictions ?? [];
  const memberPrediction = predictions.find((prediction) => prediction.league_member_id === memberId);

  if (isScheduled) {
    return <Schedule prediction={memberPrediction} matchId={match.id} />;
  }

  if (isLive) {
    return <Live match={match} />;
  }

  return <FinishedMatch predictions={predictions} />;
}
