import { Error } from '@/components/layout';
import LeagueMatches from '@/features/matches/screens/LeagueMatches';
import TournamentScreen from '@/features/matches/screens/TournamentScreen';
import { selectCompetition, selectMemberId, useMemberStore } from '@/store/MemberStore';
export default function Matches() {
  const memberId = useMemberStore(selectMemberId);
  const competition = useMemberStore(selectCompetition);

  if (!memberId || !competition?.id) return <Error error="No active league selected" />;

  if (competition?.type?.toUpperCase() === 'CUP') {
    return <TournamentScreen />;
  }

  return <LeagueMatches competitionId={competition?.id} memberId={memberId} />;
}
