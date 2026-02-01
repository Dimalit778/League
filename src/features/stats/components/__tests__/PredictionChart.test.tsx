import { render } from '@testing-library/react-native';
import PredictionChart from '../stats/PredictionChart';

describe('PredictionChart', () => {
  const mockStats = {
    totalPredictions: 100,
    totalPoints: 250,
    accuracy: 75,
    bingoHits: 20,
    regularHits: 55,
    missedHits: 25,
  };

  it('renders prediction results heading', () => {
    const { getByText } = render(<PredictionChart stats={mockStats} />);
    expect(getByText('Prediction Results')).toBeTruthy();
  });

  it('renders legend labels', () => {
    const { getByText } = render(<PredictionChart stats={mockStats} />);
    expect(getByText(/Bingo/)).toBeTruthy();
    expect(getByText(/Regular/)).toBeTruthy();
    expect(getByText(/Missed/)).toBeTruthy();
  });

  it('renders with zero stats', () => {
    const zeroStats = {
      totalPredictions: 0,
      totalPoints: 0,
      accuracy: 0,
      bingoHits: 0,
      regularHits: 0,
      missedHits: 0,
    };
    const { getByText } = render(<PredictionChart stats={zeroStats} />);
    expect(getByText('Prediction Results')).toBeTruthy();
  });
});
