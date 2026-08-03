import { getMatchCardMetrics } from '../MatchCardBg';

describe('getMatchCardMetrics', () => {
  it('fills a phone while capping card width on iPad', () => {
    expect(getMatchCardMetrics(390).width).toBe(358);
    expect(getMatchCardMetrics(1024).width).toBe(640);
  });
});
