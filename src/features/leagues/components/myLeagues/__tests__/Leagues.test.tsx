import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Leagues } from '../Leagues';

const mockSetPrimaryLeague = jest.fn();
const mockUpdatePrimaryLeague = jest.fn();

const mockLeagues = [
  {
    active: true,
    competition_id: 1,
    competition_logo: null,
    competition_season_id: 2026,
    is_primary: true,
    league_id: 'primary-league',
    league_name: 'Primary League',
    member_id: 'primary-member',
    members_count: 2,
    nickname: 'Primary player',
    rank: 1,
    total_points: 10,
  },
  {
    active: false,
    competition_id: 2,
    competition_logo: null,
    competition_season_id: 2026,
    is_primary: false,
    league_id: 'locked-league',
    league_name: 'Locked League',
    member_id: 'locked-member',
    members_count: 3,
    nickname: 'Locked player',
    rank: 2,
    total_points: 5,
  },
];

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetMyLeaguesSummary: () => ({ data: mockLeagues, isLoading: false }),
  useUpdatePrimaryLeague: () => ({ mutateAsync: mockUpdatePrimaryLeague }),
}));

jest.mock('@/store/PrimaryLeagueStore', () => ({
  usePrimaryLeagueStore: (selector: (state: unknown) => unknown) =>
    selector({ leagueId: 'primary-league', setPrimaryLeague: mockSetPrimaryLeague }),
}));

jest.mock('../PrimaryLeagueCard', () => ({
  __esModule: true,
  default: () => null,
}));

describe('Leagues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatePrimaryLeague.mockResolvedValue(undefined);
  });

  it('continues into the selected locked league after a successful upgrade', async () => {
    const upgrade = jest.fn().mockResolvedValue(true);
    const { getByText } = render(<Leagues isPro={false} upgrade={upgrade} />);

    fireEvent.press(getByText('Locked League'));

    await waitFor(() => expect(upgrade).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockSetPrimaryLeague).toHaveBeenCalledWith({
        memberId: 'locked-member',
        leagueId: 'locked-league',
        competitionId: 2,
        seasonId: 2026,
        nickname: 'Locked player',
        avatarUrl: null,
      }),
    );
    expect(router.replace).toHaveBeenCalledWith('/(app)/(league)/(tabs)');
    expect(mockUpdatePrimaryLeague).toHaveBeenCalledWith({ leagueId: 'locked-league' });
  });
});
