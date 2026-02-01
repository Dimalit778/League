import { render } from '@testing-library/react-native';
import StatsCard from '../stats/StatsCard';

describe('StatsCard', () => {
  it('renders title and value', () => {
    const { getByText } = render(<StatsCard title="Total Points" value={42} />);
    expect(getByText('Total Points')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(<StatsCard title="Accuracy" value="85%" subtitle="Correct predictions" />);
    expect(getByText('Accuracy')).toBeTruthy();
    expect(getByText('85%')).toBeTruthy();
    expect(getByText('Correct predictions')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByText } = render(<StatsCard title="Points" value={10} />);
    expect(queryByText('Correct predictions')).toBeNull();
  });

  it('renders string value', () => {
    const { getByText } = render(<StatsCard title="Rate" value="N/A" />);
    expect(getByText('N/A')).toBeTruthy();
  });

  it('renders zero value', () => {
    const { getByText } = render(<StatsCard title="Missed" value={0} />);
    expect(getByText('0')).toBeTruthy();
  });
});
