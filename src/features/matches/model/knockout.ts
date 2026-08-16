import type { MatchListItem } from '../types';
import { isKnockoutStage } from '../utils/tournamentMatches';

export type Tie = {
  key: string;
  stage: string;
  legs: MatchListItem[]; // 1..2, ordered by kick_off ascending
  aggregate: { home: number; away: number } | null;
  advancingTeamId: number | null;
};

const teamPairKey = (a: number, b: number) => (a <= b ? `${a}-${b}` : `${b}-${a}`);

const winnerTeamId = (match: MatchListItem): number | null => {
  const winner = match.score?.winner;
  if (winner === 'HOME_TEAM') return match.home_team_id;
  if (winner === 'AWAY_TEAM') return match.away_team_id;
  return null;
};

const legGoalsForTeam = (match: MatchListItem, teamId: number): number | null => {
  const ft = match.score?.fullTime;
  if (!ft || ft.home == null || ft.away == null) return null;
  if (match.home_team_id === teamId) return ft.home;
  if (match.away_team_id === teamId) return ft.away;
  return null;
};

const isFinished = (match: MatchListItem) => match.status === 'FINISHED';

function buildTie(stage: string, key: string, unordered: MatchListItem[]): Tie {
  const legs = [...unordered].sort(
    (a, b) => new Date(a.kick_off).getTime() - new Date(b.kick_off).getTime(),
  );
  const homeId = legs[0].home_team_id;
  const awayId = legs[0].away_team_id;

  let aggregate: Tie['aggregate'] = null;
  if (legs.length === 2 && homeId != null && awayId != null) {
    let home = 0;
    let away = 0;
    let complete = true;
    for (const leg of legs) {
      const h = legGoalsForTeam(leg, homeId);
      const a = legGoalsForTeam(leg, awayId);
      if (h == null || a == null) {
        complete = false;
        break;
      }
      home += h;
      away += a;
    }
    if (complete) aggregate = { home, away };
  }

  let advancingTeamId: number | null = null;
  if (legs.length === 1) {
    advancingTeamId = isFinished(legs[0]) ? winnerTeamId(legs[0]) : null;
  } else if (aggregate && legs.every(isFinished)) {
    if (aggregate.home > aggregate.away) advancingTeamId = homeId;
    else if (aggregate.away > aggregate.home) advancingTeamId = awayId;
    else {
      const secondLeg = legs[1];
      advancingTeamId =
        secondLeg.score?.duration === 'PENALTY_SHOOTOUT' ? winnerTeamId(secondLeg) : null;
    }
  }

  return { key, stage, legs, aggregate, advancingTeamId };
}

export function pairKnockoutTies(matches: MatchListItem[]): Tie[] {
  const groups = new Map<string, MatchListItem[]>();
  for (const match of matches) {
    if (match.home_team_id == null || match.away_team_id == null || !match.stage) continue;
    const key = `${match.stage}:${teamPairKey(match.home_team_id, match.away_team_id)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(match);
    else groups.set(key, [match]);
  }

  return Array.from(groups.entries()).map(([key, legs]) =>
    buildTie(legs[0].stage as string, key, legs),
  );
}

export const selectKnockoutTies = (matches: MatchListItem[]): Tie[] =>
  pairKnockoutTies(matches.filter((match) => isKnockoutStage(match.stage)));
