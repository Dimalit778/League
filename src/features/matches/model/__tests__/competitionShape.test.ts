import { resolveCompetitionShape } from '../competitionShape';

describe('resolveCompetitionShape', () => {
  it.each(['PL', 'BL1', 'PD'])('returns REGULAR for %s', (code) => {
    expect(resolveCompetitionShape(code)).toBe('REGULAR');
  });

  it('returns GROUPS_KO for the World Cup', () => {
    expect(resolveCompetitionShape('WC')).toBe('GROUPS_KO');
  });

  it('returns LEAGUEPHASE_KO for Champions League', () => {
    expect(resolveCompetitionShape('cl')).toBe('LEAGUEPHASE_KO');
  });

  it('returns null instead of guessing for an unsupported competition', () => {
    expect(resolveCompetitionShape('FA')).toBeNull();
    expect(resolveCompetitionShape(null)).toBeNull();
  });
});
