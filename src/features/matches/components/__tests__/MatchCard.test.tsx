import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { MatchCard } from '../MatchCard';
import type { MatchCardData } from '../../utils/matchCard.mapper';

const createCard = (overrides: Partial<MatchCardData> = {}): MatchCardData => ({
  id: 42,
  kickOff: '2027-08-15T17:30:00.000Z',
  status: 'SCHEDULED',
  home: { name: 'Home', tla: 'HOM', clubColors: 'Red / White', score: null },
  away: { name: 'Away', tla: 'AWY', clubColors: 'Blue / Black', score: null },
  prediction: null,
  predictionStatus: 'none',
  predictionPoints: null,
  date: '15 Aug',
  time: '20:30',
  ...overrides,
});

describe('MatchCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the list view model and opens match details', () => {
    const screen = render(<MatchCard match={createCard()} />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Away')).toBeTruthy();
    expect(screen.getByText('15 Aug')).toBeTruthy();

    fireEvent.press(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith('/(app)/(league)/match/42');
  });

  it('shows the finished state without a prediction', () => {
    const screen = render(
      <MatchCard
        match={createCard({
          status: 'FINISHED',
          home: { name: 'Home', tla: 'HOM', clubColors: 'Red / White', score: 2 },
          away: { name: 'Away', tla: 'AWY', clubColors: 'Blue / Black', score: 1 },
        })}
      />,
    );

    // The top tab stays visible on finished cards; with no scored prediction it keeps "FT".
    expect(screen.getByText('FT')).toBeTruthy();
    expect(screen.queryByText('15 Aug')).toBeNull();
    expect(screen.getByText('2 - 1')).toBeTruthy();
    expect(screen.getByText('No prediction')).toBeTruthy();
  });

  it('shows the earned points in the top tab once scored', () => {
    const cases = [
      { predictionPoints: 5, label: '+5 pts' },
      { predictionPoints: 3, label: '+3 pts' },
      { predictionPoints: 0, label: '+0 pts' },
    ];

    for (const { predictionPoints, label } of cases) {
      const screen = render(
        <MatchCard
          match={createCard({
            status: 'FINISHED',
            home: { name: 'Home', tla: 'HOM', clubColors: 'Red / White', score: 2 },
            away: { name: 'Away', tla: 'AWY', clubColors: 'Blue / Black', score: 1 },
            prediction: { home: 2, away: 1 },
            predictionStatus: predictionPoints > 0 ? 'correct' : 'incorrect',
            predictionPoints,
          })}
        />,
      );

      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.queryByText('FT')).toBeNull();
      screen.unmount();
    }
  });
});
