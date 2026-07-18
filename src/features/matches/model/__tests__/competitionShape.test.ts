import { resolveCompetitionShape } from '../competitionShape';

const m = (stage: string | null) => ({ stage });

describe('resolveCompetitionShape', () => {
  it('returns REGULAR for a LEAGUE competition regardless of stages', () => {
    expect(resolveCompetitionShape('league', [m(null)])).toBe('REGULAR');
    expect(resolveCompetitionShape('League', [m('REGULAR_SEASON')])).toBe('REGULAR');
  });

  it('returns GROUPS_KO when a CUP has any group-stage match (World Cup)', () => {
    expect(resolveCompetitionShape('cup', [m('GROUP_STAGE'), m('FINAL')])).toBe('GROUPS_KO');
  });

  it('returns LEAGUEPHASE_KO when a CUP has a league-phase match (Champions League)', () => {
    expect(resolveCompetitionShape('cup', [m('LEAGUE_STAGE'), m('LAST_16')])).toBe('LEAGUEPHASE_KO');
    expect(resolveCompetitionShape('cup', [m('REGULAR_SEASON'), m('FINAL')])).toBe('LEAGUEPHASE_KO');
  });

  it('returns KNOCKOUT_ONLY for a CUP with only knockout stages', () => {
    expect(resolveCompetitionShape('cup', [m('SEMI_FINALS'), m('FINAL')])).toBe('KNOCKOUT_ONLY');
  });

  it('prefers GROUPS_KO over LEAGUEPHASE_KO if both stage kinds somehow appear', () => {
    expect(resolveCompetitionShape('cup', [m('GROUP_STAGE'), m('LEAGUE_STAGE')])).toBe('GROUPS_KO');
  });

  it('defaults an empty CUP to KNOCKOUT_ONLY', () => {
    expect(resolveCompetitionShape('cup', [])).toBe('KNOCKOUT_ONLY');
  });
});
