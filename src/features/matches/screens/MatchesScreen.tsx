import RegularLeagueScreen from '@/features/matches/screens/RegularLeagueScreen';
import TournamentScreen from '@/features/matches/screens/TournamentScreen';
import { usePrimaryMember } from '@/store/MemberStore';

const MatchesScreen = () => {
  const { competitionType } = usePrimaryMember();

  if (competitionType?.toUpperCase() === 'CUP') return <TournamentScreen />;

  return <RegularLeagueScreen />;
};

export default MatchesScreen;
