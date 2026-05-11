import MatchesScreen from '@/features/matches/screens/MatchesScreen';
import TournamentScreen from '@/features/matches/screens/TournamentScreen';
import { useMemberStore } from '@/store/MemberStore';

export default function Matches() {
  const data = useMemberStore((s) => s.activeMember);

  const isLeague = data?.league?.competition?.type?.toLowerCase() === 'league';

  if (isLeague) {
    return <MatchesScreen />;
  }
  return <TournamentScreen />;
}
