import { fireEvent, render } from '@testing-library/react-native';
import MyLeagueCard from '../myleagues/LeaguesList';

const mockItem = {
  avatar_url: null,
  created_at: '2026-01-01',
  id: 'm1',
  league_id: 'l1',
  active: true,
  updated_at: '2026-01-01',
  user_id: 'u1',
  league: {
    competition_id: 1,
    created_at: '2026-01-01',
    id: 'l1',
    join_code: 'ABC1234',
    max_members: 6,
    name: 'My Test League',
    owner_id: 'u1',
    updated_at: '2026-01-01',
    competition: {
      area: 'England',
      code: 'PL',
      created_at: '2026-01-01',
      current_fixture: 1,
      current_stage: 'LEAGUE',
      flag: 'https://example.com/flag.png',
      id: 1,
      is_free: true,
      logo: 'https://example.com/logo.png',
      name: 'Premier League',
      season_end: null,
      season_id: null,
      season_start: null,
      total_fixtures: 38,
      type: 'LEAGUE',
      updated_at: '2026-01-01',
    },
  },
  nickname: 'TestPlayer',
  is_primary: false,
};

describe('MyLeagueCard', () => {
  it('renders league name', () => {
    const { getByText } = render(<MyLeagueCard item={mockItem} onPress={jest.fn()} />);
    expect(getByText('My Test League')).toBeTruthy();
  });

  it('renders nickname', () => {
    const { getByText } = render(<MyLeagueCard item={mockItem} onPress={jest.fn()} />);
    expect(getByText('TestPlayer')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyLeagueCard item={mockItem} onPress={onPress} />);
    fireEvent.press(getByText('My Test League'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
