import type { MatchListItem } from '../../types';
import { pairKnockoutTies, selectKnockoutTies } from '../knockout';

const mk = (o: Partial<MatchListItem>): MatchListItem =>
  ({
    id: 0,
    competition_id: 1,
    fixture: null,
    kick_off: '2026-06-01T18:00:00Z',
    stage: 'QUARTER_FINALS',
    group: null,
    home_team_id: 1,
    away_team_id: 2,
    status: 'FINISHED',
    score: { winner: null, duration: 'REGULAR', fullTime: { home: 0, away: 0 } },
    home_team: null,
    away_team: null,
    ai_summary_en: null,
    ai_summary_he: null,
    ai_predicted_home_score: null,
    ai_predicted_away_score: null,
    prediction: null,
    ...o,
  }) as MatchListItem;

describe('pairKnockoutTies', () => {
  it('treats a single-leg World Cup knockout match as a one-leg tie with no aggregate', () => {
    const ties = pairKnockoutTies([mk({ id: 10, stage: 'FINAL', home_team_id: 3, away_team_id: 4 })]);
    expect(ties).toHaveLength(1);
    expect(ties[0].legs.map((l) => l.id)).toEqual([10]);
    expect(ties[0].aggregate).toBeNull();
  });

  it('pairs the two legs of a Champions League tie and orders them by kick_off', () => {
    const legB = mk({
      id: 21,
      home_team_id: 2,
      away_team_id: 1,
      kick_off: '2026-03-15T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 2, away: 0 } },
    });
    const legA = mk({
      id: 20,
      home_team_id: 1,
      away_team_id: 2,
      kick_off: '2026-03-08T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 1, away: 0 } },
    });
    const ties = pairKnockoutTies([legB, legA]);
    expect(ties).toHaveLength(1);
    expect(ties[0].legs.map((l) => l.id)).toEqual([20, 21]); // leg1 = earlier
    // tie-home = team 1 (legs[0].home_team_id). leg1: 1 scores 1. leg2: team1 away, concedes 2 -> team1 total 1, team2 total 2
    expect(ties[0].aggregate).toEqual({ home: 1, away: 2 });
    expect(ties[0].advancingTeamId).toBe(2);
  });

  it('resolves a level aggregate only via a second-leg penalty shootout', () => {
    const leg1 = mk({
      id: 30,
      home_team_id: 1,
      away_team_id: 2,
      kick_off: '2026-03-08T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 1, away: 0 } },
    });
    const leg2 = mk({
      id: 31,
      home_team_id: 2,
      away_team_id: 1,
      kick_off: '2026-03-15T20:00:00Z',
      score: { winner: 'HOME_TEAM', duration: 'PENALTY_SHOOTOUT', fullTime: { home: 1, away: 0 } },
    });
    const [tie] = pairKnockoutTies([leg1, leg2]);
    expect(tie.aggregate).toEqual({ home: 1, away: 1 });
    expect(tie.advancingTeamId).toBe(2); // leg2 home team won the shootout
  });

  it('leaves advancingTeamId null for an unfinished tie', () => {
    const leg1 = mk({
      id: 40,
      status: 'FINISHED',
      home_team_id: 1,
      away_team_id: 2,
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 1, away: 0 } },
    });
    const leg2 = mk({
      id: 41,
      status: 'SCHEDULED',
      home_team_id: 2,
      away_team_id: 1,
      kick_off: '2026-03-15T20:00:00Z',
      score: null,
    });
    const [tie] = pairKnockoutTies([leg1, leg2]);
    expect(tie.aggregate).toBeNull();
    expect(tie.advancingTeamId).toBeNull();
  });

  it('accepts an awarded result as a finished knockout leg', () => {
    const [tie] = pairKnockoutTies([
      mk({
        id: 42,
        status: 'AWARDED',
        score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 3, away: 0 } },
      }),
    ]);

    expect(tie.advancingTeamId).toBe(1);
  });
});

describe('selectKnockoutTies', () => {
  it('ignores non-knockout matches before pairing', () => {
    const group = mk({ id: 1, stage: 'GROUP_STAGE' });
    const ko = mk({ id: 2, stage: 'SEMI_FINALS', home_team_id: 5, away_team_id: 6 });
    expect(selectKnockoutTies([group, ko]).map((t) => t.stage)).toEqual(['SEMI_FINALS']);
  });
});
