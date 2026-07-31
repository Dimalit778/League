import { render } from '@testing-library/react-native';
import PredictionRank from '../match-details/PredictionRank';

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useMemberId: () => 'm1',
}));

describe('PredictionRank', () => {
  it('renders column headers', () => {
    const predictions = [
      {
        id: 'p1',
        league_member_id: 'm1',
        predicted_home_score: 2,
        predicted_away_score: 1,
        points: 5,
        league_member: {
          id: 'm1',
          nickname: 'TestUser',
          avatar_url: null,
        },
      },
    ];

    const { getByText } = render(<PredictionRank predictions={predictions as any} />);
    expect(getByText('Player')).toBeTruthy();
    expect(getByText('Prediction')).toBeTruthy();
    expect(getByText('Points')).toBeTruthy();
  });

  it('renders No predictions when empty', () => {
    const { getByText } = render(<PredictionRank predictions={[]} />);
    expect(getByText('No predictions')).toBeTruthy();
  });

  it('renders member nickname', () => {
    const predictions = [
      {
        id: 'p1',
        league_member_id: 'm2',
        predicted_home_score: 1,
        predicted_away_score: 0,
        points: 3,
        league_member: {
          id: 'm2',
          nickname: 'PlayerTwo',
          avatar_url: null,
        },
      },
    ];

    const { getByText } = render(<PredictionRank predictions={predictions as any} />);
    expect(getByText('PlayerTwo')).toBeTruthy();
  });
});
