import { render } from '@testing-library/react-native';
import MatchesTab from '@/app/(app)/(member)/(tabs)/Matches';

const mockState: any = {
  activeMember: {
    id: 'm1',
    league: {
      competition: {
        id: 100,
        type: 'LEAGUE',
        current_stage: 'REGULAR_SEASON',
      },
    },
  },
  setActiveMember: jest.fn(),
  initializeMember: jest.fn(),
  clearMember: jest.fn(),
};

jest.mock('@/store/MemberStore', () => {
  const actual = jest.requireActual('@/store/MemberStore');
  return {
    ...actual,
    useMemberStore: (selector: any) => selector(mockState),
  };
});

jest.mock('@/features/matches/screens/LeagueMatches', () => {
  const { Text } = require('react-native');
  return () => <Text>LeagueMatches</Text>;
});

jest.mock('@/features/matches/screens/TournamentScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>TournamentScreen</Text>;
});

describe('Matches tab display selection', () => {
  it('renders LeagueMatches for LEAGUE competition', () => {
    mockState.activeMember.league.competition.type = 'LEAGUE';
    const { getByText } = render(<MatchesTab />);
    expect(getByText('LeagueMatches')).toBeTruthy();
  });

  it('renders TournamentScreen for CUP competition', () => {
    mockState.activeMember.league.competition.type = 'CUP';
    const { getByText } = render(<MatchesTab />);
    expect(getByText('TournamentScreen')).toBeTruthy();
  });
});
