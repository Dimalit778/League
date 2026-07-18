import type { MatchBaseType } from '../types';
import { isDomesticLeagueStage, isGroupPhaseStage } from '../types/footballStages';

export type CompetitionShape = 'REGULAR' | 'LEAGUEPHASE_KO' | 'GROUPS_KO' | 'KNOCKOUT_ONLY';

/**
 * Single source of truth for which Matches view to render.
 * CL vs WC is not stored — it is inferred from the stage vocabulary present.
 */
export function resolveCompetitionShape(
  type: string | null | undefined,
  matches: Pick<MatchBaseType, 'stage'>[],
): CompetitionShape {
  if ((type ?? '').toUpperCase() === 'LEAGUE') return 'REGULAR';
  if (matches.some((match) => isGroupPhaseStage(match.stage))) return 'GROUPS_KO';
  if (matches.some((match) => isDomesticLeagueStage(match.stage))) return 'LEAGUEPHASE_KO';
  return 'KNOCKOUT_ONLY';
}
