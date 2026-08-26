import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { OverviewMatchCard } from '../OverviewMatchCard';

const createCard = (overrides: Partial<MatchCardData> = {}): MatchCardData => ({
  id: 1,
  kickOff: '2027-08-15T17:30:00.000Z',
  status: 'SCHEDULED',
  home: { name: 'Arsenal', tla: 'ARS', logo: 'a.png', clubColors: 'Red / White', score: null },
  away: { name: 'Chelsea', tla: 'CHE', logo: 'c.png', clubColors: 'Blue / Black', score: null },
  prediction: null,
  predictionStatus: 'none',
  date: 'Sat, 15/8',
  time: '20:30',
  ...overrides,
});

describe('OverviewMatchCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the date, kickoff time, and a plus icon when the match is scheduled without a prediction', () => {
    const { getByText, getByLabelText, queryByText } = render(<OverviewMatchCard match={createCard()} />);

    expect(getByText('Sat, 15/8')).toBeTruthy();
    expect(getByText('20:30')).toBeTruthy();
    expect(getByLabelText('No prediction')).toBeTruthy();
    expect(queryByText('LIVE')).toBeNull();
    expect(queryByText('FT')).toBeNull();
  });

  it('shows the saved prediction instead of a plus icon', () => {
    const { getByText, queryByLabelText } = render(
      <OverviewMatchCard
        match={createCard({
          prediction: { home: 2, away: 1 },
        })}
      />,
    );

    expect(getByText('2-1')).toBeTruthy();
    expect(queryByLabelText('No prediction')).toBeNull();
  });

  it('shows LIVE and a dash when the match is live without a prediction', () => {
    const { getByText, queryByText } = render(
      <OverviewMatchCard match={createCard({ status: 'LIVE' })} />,
    );

    expect(getByText('LIVE')).toBeTruthy();
    expect(getByText('–')).toBeTruthy();
    expect(queryByText('Sat, 15/8')).toBeNull();
  });

  it('shows FT and the prediction when the match is finished', () => {
    const { getByText, queryByText } = render(
      <OverviewMatchCard
        match={createCard({
          status: 'FINISHED',
          prediction: { home: 2, away: 1 },
        })}
      />,
    );

    expect(getByText('FT')).toBeTruthy();
    expect(getByText('2-1')).toBeTruthy();
    expect(queryByText('20:30')).toBeNull();
  });

  it('shows the match score instead of kickoff time', () => {
    const { getByText, queryByText } = render(
      <OverviewMatchCard
        match={createCard({
          status: 'FINISHED',
          home: { name: 'Arsenal', tla: 'ARS', logo: 'a.png', clubColors: null, score: 3 },
          away: { name: 'Chelsea', tla: 'CHE', logo: 'c.png', clubColors: null, score: 1 },
        })}
      />,
    );

    expect(getByText('3')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(queryByText('20:30')).toBeNull();
  });

  it('opens match details on press', () => {
    const { getByRole } = render(<OverviewMatchCard match={createCard({ id: 9 })} />);
    fireEvent.press(getByRole('button'));
    expect(router.push).toHaveBeenCalledWith('/(app)/(league)/match/9');
  });
});
