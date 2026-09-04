import { render } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import PredictionRank from '../match-details/PredictionRank';

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useMemberId: () => 'm1',
}));

describe('PredictionRank', () => {
  it('renders a compact prediction row without table headers', () => {
    const predictions = [
      {
        id: 'p1',
        league_member_id: 'm1',
        home_score: 2,
        away_score: 1,
        points: 5,
        league_member: {
          id: 'm1',
          nickname: 'TestUser',
          avatar_url: null,
        },
      },
    ];

    const { getByText, queryByText } = render(
      <PredictionRank predictions={predictions as any} isFinished />,
    );
    expect(getByText('TestUser')).toBeTruthy();
    expect(getByText('2 - 1')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(queryByText('Player')).toBeNull();
  });

  it('hides points until the match is finished', () => {
    const predictions = [
      {
        id: 'p1',
        league_member_id: 'm1',
        home_score: 2,
        away_score: 1,
        points: 5,
        league_member: { id: 'm1', nickname: 'TestUser', avatar_url: null },
      },
    ];

    const { getByText, queryByText } = render(
      <PredictionRank predictions={predictions as any} />,
    );
    expect(getByText('2 - 1')).toBeTruthy();
    expect(queryByText('5')).toBeNull();
  });

  it('renders No predictions when empty', () => {
    const { getByText, UNSAFE_queryAllByType } = render(<PredictionRank predictions={[]} />);
    expect(getByText('No predictions')).toBeTruthy();
    expect(UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(0);
  });

  it('shows a spinner while predictions are loading', () => {
    const { queryByText, UNSAFE_getAllByType } = render(<PredictionRank predictions={[]} isLoading />);
    expect(queryByText('No predictions')).toBeNull();
    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
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
