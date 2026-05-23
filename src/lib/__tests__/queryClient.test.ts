import { KEYS } from '../queryClient';

describe('KEYS', () => {
  describe('users', () => {
    it('has all key', () => {
      expect(KEYS.users.all).toEqual(['users']);
    });

    it('generates detail key', () => {
      expect(KEYS.users.detail('u1')).toEqual(['users', 'u1']);
    });

    it('generates leagues key', () => {
      expect(KEYS.users.leagues('u1')).toEqual(['users', 'u1', 'leagues']);
    });
  });

  describe('members', () => {
    it('has all key', () => {
      expect(KEYS.members.all).toEqual(['members']);
    });

    it('generates byId key', () => {
      expect(KEYS.members.byId('m1')).toEqual(['members', 'm1']);
    });

    it('generates primary key', () => {
      expect(KEYS.members.primary('u1')).toEqual(['members', 'primary', 'u1']);
    });

    it('generates stats key', () => {
      expect(KEYS.members.stats('m1')).toEqual(['members', 'm1', 'stats']);
    });
  });

  describe('leagues', () => {
    it('has all key', () => {
      expect(KEYS.leagues.all).toEqual(['leagues']);
    });

    it('generates detail key', () => {
      expect(KEYS.leagues.detail('l1')).toEqual(['leagues', 'l1']);
    });

    it('generates byJoinCode key', () => {
      expect(KEYS.leagues.byJoinCode('ABC1234')).toEqual(['leagues', 'code', 'ABC1234']);
    });

    it('generates leaderboard key', () => {
      expect(KEYS.leagues.leaderboard('l1')).toEqual(['leagues', 'l1', 'leaderboard']);
    });
  });

  describe('matches', () => {
    it('generates detail key', () => {
      expect(KEYS.matches.detail(42)).toEqual(['matches', 42]);
    });

    it('generates withPredictions key', () => {
      expect(KEYS.matches.withPredictions('l1', 42)).toEqual(['matches', 42, 'predictions', 'l1']);
    });

    it('generates byFixture key with member', () => {
      const key = KEYS.matches.byFixture(5, 100, 'm1');
      expect(key).toEqual(['matches', 100, 'fixture', 5, 'member', 'm1']);
    });

    it('generates byFixture key without member', () => {
      const key = KEYS.matches.byFixture(5, 100);
      expect(key).toEqual(['matches', 100, 'fixture', 5]);
    });

    it('generates byCompetition key', () => {
      const key = KEYS.matches.byCompetition(100, 'm1');
      expect(key).toEqual(['matches', 100, 'competition', 'member', 'm1']);
    });

    it('generates phase-specific keys', () => {
      expect(KEYS.matches.fixture(100, 5, 'm1')).toEqual([
        'matches',
        100,
        'phase',
        'fixture',
        5,
        'member',
        'm1',
        'all',
      ]);
      expect(KEYS.matches.fixture(100, 5, 'm1', 'LEAGUE_STAGE')).toEqual([
        'matches',
        100,
        'phase',
        'fixture',
        5,
        'member',
        'm1',
        'LEAGUE_STAGE',
      ]);
    });
  });

  describe('predictions', () => {
    it('generates byMember key', () => {
      expect(KEYS.predictions.byMember('m1')).toEqual(['predictions', 'member', 'm1']);
    });

    it('generates byFixture key', () => {
      expect(KEYS.predictions.byFixture('m1', 5)).toEqual(['predictions', 'member', 'm1', 'fixture', 5]);
    });

    it('generates byLeagueFixture key', () => {
      expect(KEYS.predictions.byLeagueFixture('l1', 5)).toEqual(['predictions', 'league', 'l1', 'fixture', 5]);
    });
  });

  describe('competitions', () => {
    it('has all key', () => {
      expect(KEYS.competitions.all).toEqual(['competitions']);
    });

    it('generates fixtures key', () => {
      expect(KEYS.competitions.fixtures(100)).toEqual(['competitions', '100', 'fixtures']);
    });

    it('generates match meta key', () => {
      expect(KEYS.competitions.matchMeta(100)).toEqual(['competitions', '100', 'match-meta']);
    });
  });

  describe('standings', () => {
    it('generates group standings key', () => {
      expect(KEYS.standings.group(100, 2026, 'A')).toEqual(['standings', 100, 2026, 'group', 'A']);
      expect(KEYS.standings.group(100, null, 'A')).toEqual(['standings', 100, 'current', 'group', 'A']);
    });
  });

  describe('subscriptions', () => {
    it('generates detail key', () => {
      expect(KEYS.subscriptions.detail('u1')).toEqual(['subscriptions', 'u1']);
    });

    it('generates canCreateLeague key', () => {
      expect(KEYS.subscriptions.canCreateLeague('u1')).toEqual(['subscriptions', 'u1', 'can-create']);
    });
  });

  describe('admin', () => {
    it('has dashboard key', () => {
      expect(KEYS.admin.dashboard).toEqual(['admin', 'dashboard']);
    });

    it('has users key', () => {
      expect(KEYS.admin.users).toEqual(['admin', 'users']);
    });
  });
});
