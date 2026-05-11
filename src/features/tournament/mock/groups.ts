import { WCGroup, WCMatch, WCStandingRow, WCTeam } from '../types';
import { team } from './teams';

export const GROUP_TEAMS: Record<WCGroup, WCTeam[]> = {
  A: [team('QAT'), team('ECU'), team('SEN'), team('NED')],
  B: [team('ENG'), team('IRN'), team('USA'), team('WAL')],
  C: [team('ARG'), team('KSA'), team('MEX'), team('POL')],
  D: [team('FRA'), team('AUS'), team('DEN'), team('TUN')],
  E: [team('ESP'), team('CRC'), team('GER'), team('JPN')],
  F: [team('BEL'), team('CAN'), team('MAR'), team('CRO')],
  G: [team('BRA'), team('SRB'), team('SUI'), team('CMR')],
  H: [team('POR'), team('GHA'), team('URU'), team('KOR')],
};

export const GROUP_LIST: WCGroup[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const computeStandings = (group: WCGroup, matches: WCMatch[]): WCStandingRow[] => {
  const teams = GROUP_TEAMS[group];
  const rows: Record<number, WCStandingRow> = {};
  for (const t of teams) {
    rows[t.id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  }
  for (const m of matches) {
    if (m.stage !== 'GROUP_STAGE' || m.group !== group || m.status !== 'FINISHED') continue;
    if (m.home_score == null || m.away_score == null) continue;
    const h = rows[m.home_team.id];
    const a = rows[m.away_team.id];
    if (!h || !a) continue;
    h.played += 1;
    a.played += 1;
    h.gf += m.home_score;
    h.ga += m.away_score;
    a.gf += m.away_score;
    a.ga += m.home_score;
    if (m.home_score > m.away_score) {
      h.won += 1;
      h.points += 3;
      a.lost += 1;
    } else if (m.home_score < m.away_score) {
      a.won += 1;
      a.points += 3;
      h.lost += 1;
    } else {
      h.drawn += 1;
      a.drawn += 1;
      h.points += 1;
      a.points += 1;
    }
  }
  for (const r of Object.values(rows)) r.gd = r.gf - r.ga;
  return Object.values(rows).sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf);
};
