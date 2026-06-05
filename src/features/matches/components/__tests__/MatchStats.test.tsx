import { render } from '@testing-library/react-native';
import MatchStats from '../match-details/MatchStats';

describe('MatchStats', () => {
  it('renders Coming Soon message', () => {
    const { getByText } = render(<MatchStats stats={[]} />);
    expect(getByText('Coming Soon...')).toBeTruthy();
  });

  it('renders Coming Soon regardless of stats data', () => {
    const stats = [{ label: 'Possession', home: 60, away: 40, isPercentage: true }];
    const { getByText } = render(<MatchStats stats={stats} />);
    expect(getByText('Coming Soon...')).toBeTruthy();
  });
});
