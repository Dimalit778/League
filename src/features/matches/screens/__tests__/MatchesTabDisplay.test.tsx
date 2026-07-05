import MatchesTab from '@/app/(app)/(league)/(tabs)/Matches';
import { usePrimaryMember } from '@/store/MemberStore';
import { render } from '@testing-library/react-native';

jest.mock('@/store/MemberStore', () => ({
  usePrimaryMember: jest.fn(),
}));

jest.mock('@/features/matches/screens/RegularLeagueScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>LeagueMatches</Text>;
});

jest.mock('@/features/matches/screens/TournamentScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>TournamentScreen</Text>;
});

const baseMember = {
  memberId: 'm1',
  leagueId: 'l1',
  competitionId: 100,
  member: {
    id: 'm1',
    league_id: 'l1',
    competition_id: 100,
    competition_type: 'LEAGUE',
  },
  competition: {
    id: 100,
    name: 'Premier League',
    logo: '',
    flag: null,
    type: 'LEAGUE',
    current_stage: 'REGULAR_SEASON',
    current_fixture: 1,
  },
};

describe('Matches tab display selection', () => {
  it('renders LeagueMatches for LEAGUE competition', () => {
    jest.mocked(usePrimaryMember).mockReturnValue({
      ...baseMember,
      competition: { ...baseMember.competition, type: 'LEAGUE' },
    });
    const { getByText } = render(<MatchesTab />);
    expect(getByText('LeagueMatches')).toBeTruthy();
  });

  it('renders TournamentScreen for CUP competition', () => {
    jest.mocked(usePrimaryMember).mockReturnValue({
      ...baseMember,
      competition: { ...baseMember.competition, type: 'CUP' },
    });
    const { getByText } = render(<MatchesTab />);
    expect(getByText('TournamentScreen')).toBeTruthy();
  });
});
