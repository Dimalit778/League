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
  const availableSlots = isPro ? 0 : Math.max(0, maxLeagues - activeCount);

  return {
    availableSlots,
    requiresSelection: availableSlots > 0 && inactiveCount > availableSlots,
  };
}

export function toggleLeagueActivationSelection(current: string[], memberId: string, maxSelections: number) {
  if (current.includes(memberId)) {
    return current.filter((selectedMemberId) => selectedMemberId !== memberId);
  }

  if (maxSelections <= 0) return current;
  if (current.length >= maxSelections) return [...current.slice(1), memberId];

  return [...current, memberId];
}
