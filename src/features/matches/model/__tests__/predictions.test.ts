import type { MemberPrediction } from '../../types';
import { sortMemberPredictions } from '../predictions';

const prediction = (id: string, points: number, nickname: string): MemberPrediction =>
  ({
    id,
    points,
    league_member: { id, nickname },
  }) as MemberPrediction;

describe('sortMemberPredictions', () => {
  it('sorts by points and then nickname without mutating the query data', () => {
    const source = [prediction('1', 1, 'Zed'), prediction('2', 3, 'Ben'), prediction('3', 3, 'Ari')];

    expect(sortMemberPredictions(source).map((item) => item.id)).toEqual(['3', '2', '1']);
    expect(source.map((item) => item.id)).toEqual(['1', '2', '3']);
  });
});
