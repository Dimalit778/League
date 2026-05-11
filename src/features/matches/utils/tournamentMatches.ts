import { MatchWithPredictionsType } from '../types';

export const GROUP_STAGE = 'GROUP_STAGE';
export const LEAGUE_STAGE = 'LEAGUE_STAGE';
export const FIRST_PHASE_STAGES = [GROUP_STAGE, LEAGUE_STAGE] as const;
type FirstPhaseStage = (typeof FIRST_PHASE_STAGES)[number];

const KNOCKOUT_STAGE_ORDER = [
  'LAST_32',
  'ROUND_OF_32',
  'LAST_16',
  'ROUND_OF_16',
  'LAST_8',
  'QUARTER_FINAL',
  'LAST_4',
  'SEMI_FINAL',
  'THIRD_FOURTH',
  'THIRD_PLACE',
  'THIRD_PLACE_PLAYOFF',
  'FINAL',
  'FINALS',
];

const getKnockoutStageRank = (stage: string) => {
  const index = KNOCKOUT_STAGE_ORDER.indexOf(stage);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const normalizedGroupLetter = (group: string | null | undefined): string => {
  if (group == null || group === '') return '';
  const s = group.trim();
  const lone = s.match(/^([A-Z])$/i);
  if (lone) return lone[1].toUpperCase();
  const prefixed = s.match(/group\s*([A-Z])\b/i);
  if (prefixed) return prefixed[1].toUpperCase();
  const unders = s.match(/_([A-Z])\b/i);
  if (unders) return unders[1].toUpperCase();
  const trailing = s.match(/([A-Z])\s*$/i);
  if (trailing) return trailing[1].toUpperCase();
  return s;
};

export const isLeagueCompetition = (type?: string | null) => type?.toLowerCase() === 'league';

export const isFirstPhaseStage = (stage: string | null | undefined): stage is FirstPhaseStage => {
  return FIRST_PHASE_STAGES.includes(stage as FirstPhaseStage);
};

export const getTournamentGroups = (matches: MatchWithPredictionsType[]) => {
  return Array.from(
    new Set(
      matches
        .filter((match) => match.stage === GROUP_STAGE && match.group)
        .map((match) => normalizedGroupLetter(match.group))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

export const getKnockoutStages = (matches: MatchWithPredictionsType[]) => {
  const stages = Array.from(
    new Set(
      matches.filter((match) => match.stage && !isFirstPhaseStage(match.stage)).map((match) => match.stage as string),
    ),
  );

  return stages.sort((a, b) => {
    const aIndex = getKnockoutStageRank(a);
    const bIndex = getKnockoutStageRank(b);

    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.localeCompare(b);
  });
};

export const groupMatchesByFixture = (matches: MatchWithPredictionsType[]) => {
  const grouped = matches.reduce<Record<number, MatchWithPredictionsType[]>>((acc, match) => {
    acc[match.fixture] = acc[match.fixture] ?? [];
    acc[match.fixture].push(match);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([fixture, fixtureMatches]) => ({
      fixture: Number(fixture),
      matches: fixtureMatches.sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime()),
    }))
    .sort((a, b) => a.fixture - b.fixture);
};

export const hasLeagueStage = (matches: MatchWithPredictionsType[]) => {
  return matches.some((match) => match.stage === LEAGUE_STAGE);
};

export const getStageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    LEAGUE_STAGE: 'League Phase',
    LAST_32: 'Last 32',
    ROUND_OF_32: 'Last 32',
    LAST_16: 'Last 16',
    ROUND_OF_16: 'Round of 16',
    LAST_8: 'Last 8',
    QUARTER_FINAL: 'Quarter Finals',
    LAST_4: 'Last 4',
    SEMI_FINAL: 'Semi Finals',
    THIRD_FOURTH: 'Third-Fourth',
    THIRD_PLACE: 'Third-Fourth',
    THIRD_PLACE_PLAYOFF: 'Third-Fourth',
    FINAL: 'Final',
    FINALS: 'Final',
  };

  return labels[stage] ?? stage.replace(/_/g, ' ');
};
