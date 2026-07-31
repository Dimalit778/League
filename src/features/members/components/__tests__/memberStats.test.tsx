import { render } from '@testing-library/react-native';
import MemberStats from '../memberStats';

describe('MemberStats', () => {
  const mockStats = {
    totalPredictions: 50,
    bingoHits: 10,
    regularHits: 25,
    missedHits: 15,
    accuracy: 70,
    totalPoints: 175,
    pendingPredictions: 0,
    rank: 2,
    totalMembers: 10,
    currentStreak: 3,
    longestStreak: 5,
  };

  it('renders all stat labels', () => {
    const { getByText } = render(<MemberStats stats={mockStats} />);
    expect(getByText('Predictions')).toBeTruthy();
    expect(getByText('Accuracy')).toBeTruthy();
    expect(getByText('Bingo')).toBeTruthy();
    expect(getByText('Hits')).toBeTruthy();
    expect(getByText('Missed')).toBeTruthy();
  });

  it('renders stat values', () => {
    const { getByText } = render(<MemberStats stats={mockStats} />);
    expect(getByText('50')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('renders without stats prop', () => {
    const { getByText } = render(<MemberStats />);
    expect(getByText('Predictions')).toBeTruthy();
  });
});
