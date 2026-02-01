import { render } from '@testing-library/react-native';
import FullLeagueCard from '../FullLeagueCard';

const mockLeague = {
  league_id: 'l1',
  league_name: 'Test League',
  competition_name: 'Premier League',
  competition_logo: 'https://example.com/logo.png',
  competition_area: 'England',
  competition_flag: 'https://example.com/flag.png',
  members_count: 5,
  max_members: 10,
  owner_nickname: 'JohnDoe',
};

describe('FullLeagueCard', () => {
  it('renders league name', () => {
    const { getByText } = render(<FullLeagueCard league={mockLeague} />);
    expect(getByText('Test League')).toBeTruthy();
  });

  it('renders member count', () => {
    const { getByText } = render(<FullLeagueCard league={mockLeague} />);
    expect(getByText(/5/)).toBeTruthy();
    expect(getByText(/10/)).toBeTruthy();
  });

  it('renders owner nickname', () => {
    const { getByText } = render(<FullLeagueCard league={mockLeague} />);
    expect(getByText('JohnDoe')).toBeTruthy();
  });

  it('renders competition name', () => {
    const { getByText } = render(<FullLeagueCard league={mockLeague} />);
    expect(getByText('Premier League')).toBeTruthy();
  });

  it('renders country', () => {
    const { getByText } = render(<FullLeagueCard league={mockLeague} />);
    expect(getByText('England')).toBeTruthy();
  });
});
