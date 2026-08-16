import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Leagues } from '../Leagues';

const mockSetPrimaryLeague = jest.fn();
const mockUpdatePrimaryLeague = jest.fn();

const defaultMockLeagues = [
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
  {
    active: false,
    competition_id: 3,
    competition_logo: null,
    competition_season_id: 2026,
    is_primary: false,
    league_id: 'second-locked-league',
    league_name: 'Second Locked League',
    member_id: 'second-locked-member',
    members_count: 4,
    nickname: 'Second locked player',
    rank: 3,
    total_points: 2,
  },
  {
    active: false,
    competition_id: 4,
    competition_is_free: false,
    competition_logo: null,
    competition_season_id: 2026,
    is_primary: false,
    league_id: 'pro-only-league',
    league_name: 'Pro Only League',
    member_id: 'pro-only-member',
    members_count: 5,
    nickname: 'Pro only player',
    rank: 4,
    total_points: 1,
  },
];
let mockLeagues = defaultMockLeagues;
const mockPrimaryLeagueCard = jest.fn((_props: unknown) => null);

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
  default: (props: unknown) => mockPrimaryLeagueCard(props),
}));

describe('Leagues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLeagues = defaultMockLeagues;
    mockUpdatePrimaryLeague.mockResolvedValue(undefined);
  });

  it('does not present an inactive league as the primary league', () => {
    mockLeagues = defaultMockLeagues.map((league) => ({ ...league, active: false, is_primary: false }));

    const { getByText } = render(<Leagues isPro={false} upgrade={jest.fn().mockResolvedValue(false)} />);

    expect(getByText('My Leagues')).toBeTruthy();
    expect(mockPrimaryLeagueCard).not.toHaveBeenCalled();
  });

  it('does not invent a primary league when an active membership is not marked primary', () => {
    mockLeagues = defaultMockLeagues.map((league, index) => ({
      ...league,
      active: index === 0,
      is_primary: false,
    }));

    render(<Leagues isPro={false} upgrade={jest.fn().mockResolvedValue(false)} />);

    expect(mockPrimaryLeagueCard).not.toHaveBeenCalled();
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

  it('selects an inactive league for activation instead of opening the paywall when a seat is available', async () => {
    const upgrade = jest.fn().mockResolvedValue(false);
    const onToggleLeague = jest.fn();
    const { getByText } = render(
      <Leagues
        isPro={false}
        upgrade={upgrade}
        activationSelection={{ selectedMemberIds: [], onToggleLeague }}
      />,
    );

    fireEvent.press(getByText('Locked League'));

    await waitFor(() => expect(onToggleLeague).toHaveBeenCalledWith('locked-member'));
    expect(upgrade).not.toHaveBeenCalled();
    expect(mockSetPrimaryLeague).not.toHaveBeenCalled();
  });

  it('locks a PRO-only competition league even during activation selection', () => {
    const upgrade = jest.fn().mockResolvedValue(false);
    const onToggleLeague = jest.fn();
    const { getByText, getByLabelText } = render(
      <Leagues
        isPro={false}
        upgrade={upgrade}
        activationSelection={{ selectedMemberIds: [], onToggleLeague }}
      />,
    );

    expect(getByText('Pro Only League')).toBeTruthy();

    // Locked leagues get the "Upgrade to Pro" hint; selectable ones get
    // "Select league to activate" instead (see LeagueCard's accessibilityHint).
    const card = getByLabelText('Pro Only League');
    expect(card.props.accessibilityHint).toBe('Upgrade to Pro');
  });
});
