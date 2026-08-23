import { getMatchCardMetrics } from '../MatchCardBg';

describe('getMatchCardMetrics', () => {
  it('fills a phone while keeping cards compact on wide screens', () => {
    expect(getMatchCardMetrics(390).width).toBe(358);
    expect(getMatchCardMetrics(1024).width).toBe(450);
  });

  it('shortens finished cards', () => {
    expect(getMatchCardMetrics(390, true).height).toBeLessThan(getMatchCardMetrics(390).height);
  });
});
