import { render } from '@testing-library/react-native';
import SelectCompetitionScreen from '../../screens/SelectCompetitionScreen';

jest.mock('@/features/leagues/hooks/useCompetition', () => ({
  useGetCompetitions: () => ({
    data: [
      { id: 1, name: 'Premier League', logo: 'https://example.com/pl.png', area: 'England' },
      { id: 2, name: 'La Liga', logo: 'https://example.com/ll.png', area: 'Spain' },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe('SelectCompetitionScreen', () => {
  it('renders Continue button', () => {
    const { getByText } = render(<SelectCompetitionScreen />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders competition names', () => {
    const { getByText } = render(<SelectCompetitionScreen />);
    expect(getByText('Premier League')).toBeTruthy();
    expect(getByText('La Liga')).toBeTruthy();
  });
});
