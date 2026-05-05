import { getTeamBadgeConfig, getTeamInitials, hashTeamSeed } from '../TeamBadge';

describe('TeamBadge helpers', () => {
  it('creates stable config for the same team seed', () => {
    const team = { teamId: 86, name: 'Example City', shortName: 'Example', tla: 'EXC' };

    expect(getTeamBadgeConfig(team)).toEqual(getTeamBadgeConfig(team));
  });

  it('uses tla as the preferred initials source', () => {
    expect(getTeamInitials({ tla: 'abc', shortName: 'Example City', name: 'Example City FC' })).toBe('ABC');
  });

  it('falls back to short name words when tla is missing', () => {
    expect(getTeamInitials({ tla: null, shortName: 'North Valley United', name: 'North Valley United FC' })).toBe(
      'NVU'
    );
  });

  it('falls back to FC when no readable name exists', () => {
    expect(getTeamInitials({ tla: null, shortName: null, name: null })).toBe('FC');
  });

  it('hashes different seeds differently', () => {
    expect(hashTeamSeed('team-a')).not.toBe(hashTeamSeed('team-b'));
  });
});
