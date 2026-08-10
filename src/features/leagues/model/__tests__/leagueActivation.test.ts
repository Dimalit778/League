import {
  requiresLeagueActivationResolution,
  resolveActivationTargetCount,
  resolveVacantLeagueSlots,
  toggleLeagueActivationSelection,
} from '../leagueActivation';

describe('resolveVacantLeagueSlots', () => {
  it('does not require a choice when the only inactive league fits the vacant seat', () => {
    expect(
      resolveVacantLeagueSlots({ isPro: false, activeCount: 1, inactiveCount: 1, maxLeagues: 2 }),
    ).toEqual({ availableSlots: 1, requiresSelection: false });
  });

  it('requires one choice when several inactive leagues compete for one vacant seat', () => {
    expect(
      resolveVacantLeagueSlots({ isPro: false, activeCount: 1, inactiveCount: 2, maxLeagues: 2 }),
    ).toEqual({ availableSlots: 1, requiresSelection: true });
  });

  it('allows choosing two leagues after both free seats become vacant', () => {
    expect(
      resolveVacantLeagueSlots({ isPro: false, activeCount: 0, inactiveCount: 3, maxLeagues: 2 }),
    ).toEqual({ availableSlots: 2, requiresSelection: true });
  });

  it('does not expose the free-plan selection flow to pro users', () => {
    expect(
      resolveVacantLeagueSlots({ isPro: true, activeCount: 1, inactiveCount: 3, maxLeagues: 5 }),
    ).toEqual({ availableSlots: 0, requiresSelection: false });
  });
});

describe('requiresLeagueActivationResolution', () => {
  it('does not trigger for a pro user regardless of state', () => {
    expect(
      requiresLeagueActivationResolution({
        isPro: true,
        activeCount: 5,
        maxLeagues: 2,
        hasIneligibleActiveLeague: true,
      }),
    ).toBe(false);
  });

  it('triggers on count overflow alone, as before', () => {
    expect(
      requiresLeagueActivationResolution({
        isPro: false,
        activeCount: 3,
        maxLeagues: 2,
        hasIneligibleActiveLeague: false,
      }),
    ).toBe(true);
  });

  it('triggers on an ineligible active league even when the count is within the plan limit', () => {
    expect(
      requiresLeagueActivationResolution({
        isPro: false,
        activeCount: 1,
        maxLeagues: 2,
        hasIneligibleActiveLeague: true,
      }),
    ).toBe(true);
  });

  it('does not trigger when count and eligibility are both fine', () => {
    expect(
      requiresLeagueActivationResolution({
        isPro: false,
        activeCount: 2,
        maxLeagues: 2,
        hasIneligibleActiveLeague: false,
      }),
    ).toBe(false);
  });
});

describe('resolveActivationTargetCount', () => {
  it('targets the plan max when enough eligible leagues exist', () => {
    expect(resolveActivationTargetCount(2, 5)).toBe(2);
  });

  it('caps the target at however many eligible leagues the user actually has', () => {
    expect(resolveActivationTargetCount(2, 1)).toBe(1);
  });

  it('is zero when the user has no eligible leagues at all (upgrade is the only path)', () => {
    expect(resolveActivationTargetCount(2, 0)).toBe(0);
  });
});

describe('toggleLeagueActivationSelection', () => {
  it('replaces the selected league immediately when only one seat is available', () => {
    expect(toggleLeagueActivationSelection(['member-1'], 'member-2', 1)).toEqual(['member-2']);
  });

  it('replaces the oldest selection when all available seats are already selected', () => {
    expect(toggleLeagueActivationSelection(['member-1', 'member-2'], 'member-3', 2)).toEqual([
      'member-2',
      'member-3',
    ]);
  });

  it('still allows deselecting the currently selected league', () => {
    expect(toggleLeagueActivationSelection(['member-1'], 'member-1', 1)).toEqual([]);
  });
});
