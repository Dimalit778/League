import type { MemberPrediction } from '../types';

export function sortMemberPredictions(predictions: MemberPrediction[] | null | undefined): MemberPrediction[] {
  return [...(predictions ?? [])].sort((first, second) => {
    const pointsDifference = (second.points ?? 0) - (first.points ?? 0);
    if (pointsDifference !== 0) return pointsDifference;

    return (first.league_member?.nickname ?? '').localeCompare(second.league_member?.nickname ?? '');
  });
}
