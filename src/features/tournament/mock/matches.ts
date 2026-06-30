import { WCGroup, WCMatch, WCMatchday, WCStage, WCTeam } from '../types';
import { GROUP_LIST, GROUP_TEAMS } from './groups';
import { team } from './teams';

let idCounter = 1;
const nextId = () => idCounter++;

// Each group has 4 teams → 6 matches across 3 matchdays:
// MD1: T1 vs T2,  T3 vs T4
// MD2: T1 vs T3,  T2 vs T4
// MD3: T1 vs T4,  T2 vs T3
const groupSchedule: [number, number, WCMatchday][] = [
  [0, 1, 1],
  [2, 3, 1],
  [0, 2, 2],
  [1, 3, 2],
  [0, 3, 3],
  [1, 2, 3],
];

// Predetermined group results per group (matches order matches groupSchedule).
// Using realistic-ish scores so the standings table looks varied.
const GROUP_RESULTS: Record<WCGroup, [number, number][]> = {
  A: [
    [0, 2], // QAT 0-2 ECU
    [0, 2], // SEN 0-2 NED
    [1, 3], // QAT 1-3 SEN
    [1, 1], // ECU 1-1 NED
    [0, 2], // QAT 0-2 NED
    [2, 1], // ECU 2-1 SEN
  ],
  B: [
    [6, 2], // ENG 6-2 IRN
    [1, 1], // USA 1-1 WAL
    [0, 0], // ENG 0-0 USA
    [2, 0], // IRN 2-0 WAL
    [3, 0], // ENG 3-0 WAL
    [0, 1], // IRN 0-1 USA
  ],
  C: [
    [2, 1], // ARG 2-1 KSA
    [0, 0], // MEX 0-0 POL
    [2, 0], // ARG 2-0 MEX
    [0, 2], // KSA 0-2 POL
    [2, 0], // ARG 2-0 POL
    [2, 1], // KSA 2-1 MEX
  ],
  D: [
    [4, 1], // FRA 4-1 AUS
    [0, 0], // DEN 0-0 TUN
    [2, 1], // FRA 2-1 DEN
    [1, 0], // AUS 1-0 TUN
    [0, 1], // FRA 0-1 TUN
    [1, 0], // AUS 1-0 DEN
  ],
  E: [
    [7, 0], // ESP 7-0 CRC
    [1, 2], // GER 1-2 JPN
    [1, 1], // ESP 1-1 GER
    [0, 1], // CRC 0-1 JPN  (kept distinct)
    [1, 2], // ESP 1-2 JPN
    [4, 2], // CRC 4-2 GER
  ],
  F: [
    [1, 0], // BEL 1-0 CAN
    [0, 0], // MAR 0-0 CRO
    [0, 2], // BEL 0-2 MAR
    [1, 4], // CAN 1-4 CRO
    [0, 0], // BEL 0-0 CRO
    [1, 2], // CAN 1-2 MAR
  ],
  G: [
    [2, 0], // BRA 2-0 SRB
    [1, 0], // SUI 1-0 CMR
    [1, 0], // BRA 1-0 SUI
    [3, 3], // SRB 3-3 CMR
    [0, 1], // BRA 0-1 CMR
    [3, 2], // SRB 3-2 SUI  (varies for tiebreaker)
  ],
  H: [
    [3, 2], // POR 3-2 GHA
    [0, 0], // URU 0-0 KOR
    [2, 0], // POR 2-0 URU
    [3, 2], // GHA 3-2 KOR
    [2, 1], // POR 2-1 KOR
    [0, 2], // GHA 0-2 URU
  ],
};

const groupMatchKickOff = (group: WCGroup, matchday: WCMatchday) => {
  // Spread games across 12 days
  const groupIdx = GROUP_LIST.indexOf(group);
  const day = matchday * 4 + Math.floor(groupIdx / 4);
  const hour = 13 + (groupIdx % 4) * 2;
  return new Date(2026, 5, day, hour, 0, 0).toISOString();
};

const buildGroupMatches = (): WCMatch[] => {
  const out: WCMatch[] = [];
  for (const group of GROUP_LIST) {
    const teams = GROUP_TEAMS[group];
    const results = GROUP_RESULTS[group];
    groupSchedule.forEach(([i, j, md], idx) => {
      const [hs, as] = results[idx];
      out.push({
        id: nextId(),
        stage: 'GROUP_STAGE',
        group,
        matchday: md,
        kick_off: groupMatchKickOff(group, md),
        status: 'FINISHED',
        home_team: teams[i],
        away_team: teams[j],
        home_score: hs,
        away_score: as,
        // Add a user prediction to ~half the matches; mix accuracies for varied points.
        user_prediction: idx % 2 === 0 ? mockPrediction(hs, as, idx) : undefined,
      });
    });
  }
  return out;
};

const mockPrediction = (hs: number, as: number, seed: number) => {
  // Vary so some are exact, some directional, some wrong.
  const variant = seed % 4;
  if (variant === 0) return { home: hs, away: as, points: 5 }; // exact
  if (variant === 1) return { home: hs + 1, away: as, points: 2 }; // direction only
  if (variant === 2) return { home: 1, away: 1, points: 0 }; // wrong
  return { home: hs, away: as + 1, points: 2 };
};

const knockoutKickOff = (stage: WCStage, idx: number) => {
  const day = stage === 'ROUND_OF_16' ? 18 : stage === 'QUARTER_FINAL' ? 22 : stage === 'SEMI_FINAL' ? 25 : 28;
  const hour = 17 + (idx % 2) * 3;
  return new Date(2026, 5, day, hour, 0, 0).toISOString();
};

const finishedKnockout = (
  stage: WCStage,
  idx: number,
  home: WCTeam,
  away: WCTeam,
  hs: number,
  as: number
): WCMatch => ({
  id: nextId(),
  stage,
  kick_off: knockoutKickOff(stage, idx),
  status: 'FINISHED',
  home_team: home,
  away_team: away,
  home_score: hs,
  away_score: as,
  user_prediction: mockPrediction(hs, as, idx),
});

const scheduledKnockout = (stage: WCStage, idx: number, home: WCTeam, away: WCTeam): WCMatch => ({
  id: nextId(),
  stage,
  kick_off: knockoutKickOff(stage, idx),
  status: 'SCHEDULED',
  home_team: home,
  away_team: away,
  home_score: null,
  away_score: null,
});

const buildKnockoutMatches = (): WCMatch[] => {
  const out: WCMatch[] = [];
  // R16: pair group winners vs runners-up across groups (typical bracket).
  const r16: [string, string][] = [
    ['NED', 'USA'],
    ['ARG', 'AUS'],
    ['FRA', 'POL'],
    ['ENG', 'SEN'],
    ['JPN', 'CRO'],
    ['BRA', 'KOR'],
    ['MAR', 'ESP'],
    ['POR', 'SUI'],
  ];
  // Mark first 4 as finished, last 4 scheduled — gives a mix.
  const r16Scores: [number, number][] = [
    [3, 1],
    [2, 1],
    [3, 1],
    [3, 0],
  ];
  r16.forEach(([h, a], idx) => {
    if (idx < 4) {
      const [hs, as] = r16Scores[idx];
      out.push(finishedKnockout('ROUND_OF_16', idx, team(h as never), team(a as never), hs, as));
    } else {
      out.push(scheduledKnockout('ROUND_OF_16', idx, team(h as never), team(a as never)));
    }
  });

  // QF, SF, Final: all scheduled with placeholder advancing teams.
  const qf: [string, string][] = [
    ['NED', 'ARG'],
    ['CRO', 'BRA'],
    ['MAR', 'POR'],
    ['ENG', 'FRA'],
  ];
  qf.forEach(([h, a], idx) => out.push(scheduledKnockout('QUARTER_FINAL', idx, team(h as never), team(a as never))));

  const sf: [string, string][] = [
    ['ARG', 'CRO'],
    ['FRA', 'MAR'],
  ];
  sf.forEach(([h, a], idx) => out.push(scheduledKnockout('SEMI_FINAL', idx, team(h as never), team(a as never))));

  out.push(scheduledKnockout('FINAL', 0, team('ARG'), team('FRA')));
  return out;
};

export const WC_GROUP_MATCHES: WCMatch[] = buildGroupMatches();
export const WC_KNOCKOUT_MATCHES: WCMatch[] = buildKnockoutMatches();
export const WC_ALL_MATCHES: WCMatch[] = [...WC_GROUP_MATCHES, ...WC_KNOCKOUT_MATCHES];

export const getGroupMatches = (group: WCGroup, matchday?: WCMatchday) =>
  WC_GROUP_MATCHES.filter((m) => m.group === group && (matchday == null || m.matchday === matchday));

export const getKnockoutMatches = (stage: Exclude<WCStage, 'GROUP_STAGE'>) =>
  WC_KNOCKOUT_MATCHES.filter((m) => m.stage === stage);
