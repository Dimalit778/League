import type { MyLeague, MyLeaguesResponse } from '../types';

export function flattenMyLeagues(myLeagues?: MyLeaguesResponse | null): MyLeague[] {
  if (!myLeagues) return [];
  return [
    ...(myLeagues.primaryLeague ? [myLeagues.primaryLeague] : []),
    ...myLeagues.leagues,
    ...myLeagues.inactiveLeagues,
  ];
}

type VacantLeagueSlotParams = {
  isPro: boolean;
  activeCount: number;
  inactiveCount: number;
  maxLeagues: number;
};

export function resolveVacantLeagueSlots({
  isPro,
  activeCount,
  inactiveCount,
  maxLeagues,
}: VacantLeagueSlotParams) {
  const vacantSlots = isPro ? 0 : Math.max(0, maxLeagues - activeCount);
  const availableSlots = Math.min(vacantSlots, inactiveCount);

  return {
    availableSlots,
    requiresSelection: availableSlots > 0,
  };
}

type LeagueActivationRequirementParams = {
  isPro: boolean;
  activeCount: number;
  maxLeagues: number;
  hasIneligibleActiveLeague: boolean;
};

/**
 * A free-plan user must resolve their active leagues when they either hold
 * more than the plan allows, or one of their active leagues isn't eligible
 * for the plan at all (e.g. it's PRO-only) — count alone misses the latter,
 * since a single ineligible league can sit well within maxLeagues.
 */
export function requiresLeagueActivationResolution({
  isPro,
  activeCount,
  maxLeagues,
  hasIneligibleActiveLeague,
}: LeagueActivationRequirementParams): boolean {
  return !isPro && (activeCount > maxLeagues || hasIneligibleActiveLeague);
}

/**
 * The activation picker normally asks for exactly maxLeagues, but a user
 * triggered into it purely by ineligibility (not by count) may own fewer
 * eligible leagues than that — asking for more than they have would make
 * the picker unsatisfiable by selection alone (only "Upgrade" would work).
 */
export function resolveActivationTargetCount(maxLeagues: number, eligibleLeagueCount: number): number {
  return Math.min(maxLeagues, eligibleLeagueCount);
}

export function toggleLeagueActivationSelection(current: string[], memberId: string, maxSelections: number) {
  if (current.includes(memberId)) {
    return current.filter((selectedMemberId) => selectedMemberId !== memberId);
  }

  if (maxSelections <= 0) return current;
  if (current.length >= maxSelections) return [...current.slice(1), memberId];

  return [...current, memberId];
}
