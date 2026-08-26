/* eslint-disable @typescript-eslint/no-require-imports */
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { useSeasonMatches } from '@/features/matches/hooks/useSeasonMatches';
import MatchesScreen from '@/features/matches/screens/MatchesScreen';
import RegularLeagueView from '@/features/matches/views/RegularLeagueView';
import { render } from '@testing-library/react-native';

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useMemberId: () => 'm1',
  useCompetitionId: () => 100,
}));
jest.mock('@/features/leagues/hooks/useCompetition', () => ({ useGetCompetitionsDetails: jest.fn() }));
jest.mock('@/features/matches/hooks/useSeasonMatches', () => ({ useSeasonMatches: jest.fn() }));

jest.mock('@/components', () => {
  const { View, Text } = require('react-native');
  return {
    Screen: ({ children }: any) => <View>{children}</View>,
    Error: ({ error }: any) => <Text>{error}</Text>,
  };
});

jest.mock('@/features/matches/views/RegularLeagueView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: jest.fn(() => <Text>RegularLeagueView</Text>) };
});
jest.mock('@/features/matches/views/GroupsKnockoutView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>GroupsKnockoutView</Text> };
});
jest.mock('@/features/matches/views/LeaguePhaseKnockoutView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>LeaguePhaseKnockoutView</Text> };
});
const setup = (code: string, stages: string[], isRefetching = false) => {
  jest.mocked(useGetCompetitionsDetails).mockReturnValue({
    data: { code, type: code === 'CL' || code === 'WC' ? 'CUP' : 'LEAGUE', currentMatchday: 1, currentStage: stages[0] ?? null },
    isLoading: false,
    error: null,
  } as any);
  jest.mocked(useSeasonMatches).mockReturnValue({
    data: stages.map((s) => ({ stage: s })),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    isRefetching,
  } as any);
};

describe('Matches tab display selection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders RegularLeagueView for a LEAGUE competition', () => {
    setup('PL', []);
    expect(render(<MatchesScreen />).getByText('RegularLeagueView')).toBeTruthy();
  });

  it('passes the active refetch state to the rendered view', () => {
    setup('PL', [], true);
    render(<MatchesScreen />);

    expect(jest.mocked(RegularLeagueView).mock.calls[0][0]).toEqual(
      expect.objectContaining({ refreshing: true }),
    );
  });

  it('renders GroupsKnockoutView for a CUP with group stage', () => {
    setup('WC', ['GROUP_STAGE', 'FINAL']);
    expect(render(<MatchesScreen />).getByText('GroupsKnockoutView')).toBeTruthy();
  });

  it('renders LeaguePhaseKnockoutView for a CUP with a league phase', () => {
    setup('CL', ['LEAGUE_STAGE', 'LAST_16']);
    expect(render(<MatchesScreen />).getByText('LeaguePhaseKnockoutView')).toBeTruthy();
  });
});
