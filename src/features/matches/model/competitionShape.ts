export type CompetitionShape = 'REGULAR' | 'LEAGUEPHASE_KO' | 'GROUPS_KO';

const SHAPE_BY_COMPETITION_CODE: Record<string, CompetitionShape> = {
  PL: 'REGULAR',
  BL1: 'REGULAR',
  PD: 'REGULAR',
  CL: 'LEAGUEPHASE_KO',
  WC: 'GROUPS_KO',
};

/**
 * Competition format is product configuration, not something to infer from a
 * potentially partial match sync.
 */
export function resolveCompetitionShape(
  code: string | null | undefined,
): CompetitionShape | null {
  return SHAPE_BY_COMPETITION_CODE[(code ?? '').trim().toUpperCase()] ?? null;
}
