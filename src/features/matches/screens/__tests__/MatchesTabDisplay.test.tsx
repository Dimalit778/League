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
  userId: 'u1',
  isPrimary: true,
  active: true,
  nickname: 'Player1',
  avatarUrl: null,
  createdAt: '2026-01-01',
  leagueId: 'l1',
  leagueName: 'Test League',
  competitionId: 100,
  competitionName: 'Premier League',
  competitionLogo: null,
  competitionFlag: null,
  competitionArea: null,
  competitionType: 'league' as const,
};

describe('Matches tab display selection', () => {
  it('renders LeagueMatches for LEAGUE competition', () => {
    jest.mocked(usePrimaryMember).mockReturnValue({
      ...baseMember,
      competitionType: 'league',
    });
    const { getByText } = render(<MatchesTab />);
    expect(getByText('LeagueMatches')).toBeTruthy();
  });

  it('renders TournamentScreen for CUP competition', () => {
    jest.mocked(usePrimaryMember).mockReturnValue({
      ...baseMember,
      competitionType: 'cup',
    });
    const { getByText } = render(<MatchesTab />);
    expect(getByText('TournamentScreen')).toBeTruthy();
  });
});
