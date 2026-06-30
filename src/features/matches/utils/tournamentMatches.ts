import { MatchWithPredictionsType, TeamType } from '../types';
import { isDomesticLeagueStage, isGroupPhaseStage } from '../types/footballStages';

export type ComputedStandingRow = {
  position: number;
  team: TeamType;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;  
  points: number;
};

export const computeLeagueStandings = (matches: MatchWithPredictionsType[]): ComputedStandingRow[] => {
  const teamMap = new Map<number, Omit<ComputedStandingRow, 'position' | 'goalsDiff'>>();

  for (const match of matches) {
    if (match.status !== 'FINISHED' || !match.score?.fullTime) continue;
    if (match.home_team_id == null || match.away_team_id == null) continue;
    if (!match.home_team || !match.away_team) continue;

    const homeId = match.home_team_id;
    const awayId = match.away_team_id;
    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    if (!teamMap.has(homeId)) {
      teamMap.set(homeId, {
        team: homeTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    }
    if (!teamMap.has(awayId)) {
      teamMap.set(awayId, {
        team: awayTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    }

    const home = teamMap.get(homeId)!;
    const away = teamMap.get(awayId)!;

    home.played++;
    away.played++;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (awayGoals > homeGoals) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      home.points++;
      away.drawn++;
      away.points++;
    }
  }

  return Array.from(teamMap.values())
    .map((entry) => ({ ...entry, goalsDiff: entry.goalsFor - entry.goalsAgainst }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
      return b.goalsFor - a.goalsFor;
    })
    .map((entry, i) => ({ ...entry, position: i + 1 }));
};

export const isLeaguePhase = (matches: MatchWithPredictionsType[]): boolean =>
  matches.some((m) => isDomesticLeagueStage(m.stage));

export const getLeagueFixtures = (matches: MatchWithPredictionsType[]): number[] =>
  Array.from(new Set(matches.map((m) => m.fixture).filter((f): f is number => f != null))).sort((a, b) => a - b);

export const getMatchesByFixture = (matches: MatchWithPredictionsType[], fixture: number): MatchWithPredictionsType[] =>
  matches
    .filter((m) => m.fixture === fixture)
    .sort((a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime());

export const GROUP_STAGE = 'GROUP_STAGE';
export const LEAGUE_STAGE = 'LEAGUE_STAGE';
export type TournamentView = 'groups' | 'knockout';


const KNOCKOUT_STAGE_ORDER = [
  'ROUND_1',
  'ROUND_2',
  'ROUND_3',
  'ROUND_4',
  'LAST_64',
  'LAST_32',
  'ROUND_OF_32',
  'LAST_16',
  'ROUND_OF_16',
  'LAST_8',
  'QUARTER_FINAL',
  'QUARTER_FINALS',
  'LAST_4',
  'SEMI_FINAL',
  'SEMI_FINALS',
  'THIRD_FOURTH',
  'THIRD_PLACE',
  'THIRD_PLACE_PLAYOFF',
  'FINAL',
  'FINALS',
];

export const KNOCKOUT_STAGE_VALUES = KNOCKOUT_STAGE_ORDER;

const KNOCKOUT_STAGE_SET = new Set(KNOCKOUT_STAGE_ORDER);

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

export const isFirstPhaseStage = (stage: string | null | undefined): boolean => {
  return isGroupPhaseStage(stage) || isDomesticLeagueStage(stage);
};

export const isKnockoutStage = (stage: string | null | undefined) => {
  const key = stage?.trim().toUpperCase();
  return key != null && KNOCKOUT_STAGE_SET.has(key);
};

export const toTournamentGroupValue = (group: string | null | undefined): string => {
  const letter = normalizedGroupLetter(group);
  return letter ? `GROUP_${letter}` : '';
};

export const getTournamentGroups = (matches: MatchWithPredictionsType[]) => {
  return Array.from(
    new Set(
      matches
        .filter((match) => isGroupPhaseStage(match.stage) && match.group)
        .map((match) => normalizedGroupLetter(match.group))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

export const getKnockoutStages = (matches: MatchWithPredictionsType[]) => {
  const stages = Array.from(
    new Set(matches.filter((match) => isKnockoutStage(match.stage)).map((match) => match.stage as string)),
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
    if (match.fixture == null) return acc;
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
  return matches.some((match) => isDomesticLeagueStage(match.stage));
};

export const splitTournamentMatches = (matches: MatchWithPredictionsType[]) => {
  const firstPhase: MatchWithPredictionsType[] = [];
  const knockoutStages: MatchWithPredictionsType[] = [];

  for (const match of matches) {
    if (isFirstPhaseStage(match.stage)) firstPhase.push(match);
    else knockoutStages.push(match);
  }

  return { firstPhase, knockoutStages };
};

export const getGroupStageMatches = (matches: MatchWithPredictionsType[]) =>
  matches.filter((match) => match.stage === GROUP_STAGE);

export const selectKnockoutMatches = (matches: MatchWithPredictionsType[]) =>
  matches.filter((match) => isKnockoutStage(match.stage));

export const filterMatchesByGroup = (matches: MatchWithPredictionsType[], group: string) =>
  matches.filter((match) => isGroupPhaseStage(match.stage) && normalizedGroupLetter(match.group) === group);

export const getStageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    REGULAR_SEASON: 'League Phase',
    LAST_32: 'Last 32',
    LAST_64: 'Last 64',
    ROUND_4: 'Round 4',
    ROUND_3: 'Round 3',
    ROUND_2: 'Round 2',
    ROUND_1: 'Round 1',
    ROUND_OF_32: 'Last 32',
    LAST_16: 'Last 16',
    ROUND_OF_16: 'Round of 16',
    LAST_8: 'Last 8',
    QUARTER_FINAL: 'Quarter Finals',
    QUARTER_FINALS: 'Quarter Finals',
    LAST_4: 'Last 4',
    SEMI_FINAL: 'Semi Finals',
    SEMI_FINALS: 'Semi Finals',
    THIRD_FOURTH: 'Third-Fourth',
    THIRD_PLACE: 'Third-Fourth',
    THIRD_PLACE_PLAYOFF: 'Third-Fourth',
    FINAL: 'Final',
    FINALS: 'Final',
  };

  return labels[stage] ?? stage.replace(/_/g, ' ');
};
