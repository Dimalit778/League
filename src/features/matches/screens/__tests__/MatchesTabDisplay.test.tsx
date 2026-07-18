import MatchesScreen from '@/features/matches/screens/MatchesScreen';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { useSeasonMatches } from '@/features/matches/hooks/useSeasonMatches';
import { usePrimaryMember } from '@/store/MemberStore';
import { render } from '@testing-library/react-native';

jest.mock('@/store/MemberStore', () => ({ usePrimaryMember: jest.fn() }));
jest.mock('@/features/leagues/hooks/useCompetition', () => ({ useGetCompetitionsDetails: jest.fn() }));
jest.mock('@/features/matches/hooks/useSeasonMatches', () => ({ useSeasonMatches: jest.fn() }));

jest.mock('@/components/layout', () => {
  const { View, Text } = require('react-native');
  return {
    Screen: ({ children }: any) => <View>{children}</View>,
    Error: ({ error }: any) => <Text>{error}</Text>,
  };
});

jest.mock('@/features/matches/views/RegularLeagueView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>RegularLeagueView</Text> };
});
jest.mock('@/features/matches/views/GroupsKnockoutView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>GroupsKnockoutView</Text> };
});
jest.mock('@/features/matches/views/LeaguePhaseKnockoutView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>LeaguePhaseKnockoutView</Text> };
});
jest.mock('@/features/matches/views/KnockoutOnlyView', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: () => <Text>KnockoutOnlyView</Text> };
});

const setup = (type: string, stages: string[]) => {
  jest.mocked(usePrimaryMember).mockReturnValue({ memberId: 'm1', competitionId: 100 } as any);
  jest.mocked(useGetCompetitionsDetails).mockReturnValue({
    data: { type, currentFixture: 1, currentStage: stages[0] ?? null },
    isLoading: false,
    error: null,
  } as any);
  jest.mocked(useSeasonMatches).mockReturnValue({
    data: stages.map((s) => ({ stage: s })),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  } as any);
};

describe('Matches tab display selection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders RegularLeagueView for a LEAGUE competition', () => {
    setup('league', []);
    expect(render(<MatchesScreen />).getByText('RegularLeagueView')).toBeTruthy();
  });

  it('renders GroupsKnockoutView for a CUP with group stage', () => {
    setup('cup', ['GROUP_STAGE', 'FINAL']);
    expect(render(<MatchesScreen />).getByText('GroupsKnockoutView')).toBeTruthy();
  });

  it('renders LeaguePhaseKnockoutView for a CUP with a league phase', () => {
    setup('cup', ['LEAGUE_STAGE', 'LAST_16']);
    expect(render(<MatchesScreen />).getByText('LeaguePhaseKnockoutView')).toBeTruthy();
  });
});
