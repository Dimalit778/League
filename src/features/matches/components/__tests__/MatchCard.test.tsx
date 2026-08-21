import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { MatchCard } from '../MatchCard';
import type { MatchCardData } from '../../utils/matchCard.mapper';

const createCard = (overrides: Partial<MatchCardData> = {}): MatchCardData => ({
  id: 42,
  kickOff: '2027-08-15T17:30:00.000Z',
  status: 'SCHEDULED',
  home: { name: 'Home', tla: 'HOM', logo: 'home.png', clubColors: 'Red / White', score: null },
  away: { name: 'Away', tla: 'AWY', logo: 'away.png', clubColors: 'Blue / Black', score: null },
  prediction: null,
  predictionStatus: 'none',
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
          home: { name: 'Home', tla: 'HOM', logo: 'home.png', clubColors: 'Red / White', score: 2 },
          away: { name: 'Away', tla: 'AWY', logo: 'away.png', clubColors: 'Blue / Black', score: 1 },
        })}
      />,
    );

    expect(screen.queryByText('FT')).toBeNull();
    expect(screen.queryByText('15 Aug')).toBeNull();
    expect(screen.getByText('2 - 1')).toBeTruthy();
    expect(screen.getByText('No prediction')).toBeTruthy();
  });
});
