import { resolveVacantLeagueSlots, toggleLeagueActivationSelection } from '../leagueActivation';

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
