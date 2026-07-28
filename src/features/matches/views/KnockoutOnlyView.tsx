import KnockoutEngine from '../engines/KnockoutEngine';
import type { MatchCardType } from '../types';

export default function KnockoutOnlyView({
  matches,
  currentStage,
  onRefresh,
}: {
  matches: MatchCardType[];
  currentStage: string | null;
  onRefresh: () => void;
}) {
  return <KnockoutEngine matches={matches} onRefresh={onRefresh} initialStage={currentStage ?? undefined} />;
}
