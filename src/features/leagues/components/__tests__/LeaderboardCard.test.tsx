import { render } from '@testing-library/react-native';
import LeaderboardCard from '../LeaderboardCard';

const mockItem = {
  member_id: 'm1',
  nickname: 'TestUser',
  avatar_url: null,
  total_points: 42,
};

describe('LeaderboardCard', () => {
  it('renders nickname', () => {
    const { getByText } = render(
      <LeaderboardCard item={mockItem} index={0} isCurrentUser={false} />
    );
    expect(getByText('TestUser')).toBeTruthy();
  });

  it('renders total points', () => {
    const { getByText } = render(
      <LeaderboardCard item={mockItem} index={0} isCurrentUser={false} />
    );
    expect(getByText('42')).toBeTruthy();
  });

  it('renders position number', () => {
    const { getByText } = render(
      <LeaderboardCard item={mockItem} index={3} isCurrentUser={false} />
    );
    // Position is index + 4 (since top 3 are shown separately)
    expect(getByText('4')).toBeTruthy();
  });

  it('renders pts label', () => {
    const { getByText } = render(
      <LeaderboardCard item={mockItem} index={0} isCurrentUser={false} />
    );
    expect(getByText('pts')).toBeTruthy();
  });
});
