import type { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { TodayMatches } from '../TodayMatches';

const createCard = (overrides: Partial<MatchCardData> = {}): MatchCardData => ({
  id: 1,
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

describe('TodayMatches', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the empty state when there are no matches', () => {
    const { getByText } = render(<TodayMatches matches={[]} />);
    expect(getByText('No matches today')).toBeTruthy();
  });

  it('opens match details from a single card', () => {
    const { getByRole } = render(<TodayMatches matches={[createCard({ id: 7 })]} />);
    fireEvent.press(getByRole('button'));
    expect(router.push).toHaveBeenCalledWith('/(app)/(league)/match/7');
  });

  it('renders a horizontal list for multiple matches', () => {
    const { getAllByText } = render(
      <TodayMatches
        matches={[
          createCard({ id: 1, home: { name: 'Arsenal', tla: 'ARS', logo: 'a.png', clubColors: null, score: null } }),
          createCard({ id: 2, home: { name: 'Chelsea', tla: 'CHE', logo: 'c.png', clubColors: null, score: null } }),
        ]}
      />,
    );

    expect(getAllByText('ARS').length).toBeGreaterThan(0);
    expect(getAllByText('CHE').length).toBeGreaterThan(0);
  });
});
