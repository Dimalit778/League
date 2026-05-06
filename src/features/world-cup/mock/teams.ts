import { WCTeam } from '../types';

const flag = (code: string) => `https://flagcdn.com/w160/${code}.png`;

// 32 national teams, indexed by TLA. Group assignments live in groups.ts.
export const WC_TEAMS: Record<string, WCTeam> = {
  QAT: { id: 1, name: 'Qatar', tla: 'QAT', logo: flag('qa') },
  ECU: { id: 2, name: 'Ecuador', tla: 'ECU', logo: flag('ec') },
  SEN: { id: 3, name: 'Senegal', tla: 'SEN', logo: flag('sn') },
  NED: { id: 4, name: 'Netherlands', tla: 'NED', logo: flag('nl') },

  ENG: { id: 5, name: 'England', tla: 'ENG', logo: flag('gb-eng') },
  IRN: { id: 6, name: 'Iran', tla: 'IRN', logo: flag('ir') },
  USA: { id: 7, name: 'United States', tla: 'USA', logo: flag('us') },
  WAL: { id: 8, name: 'Wales', tla: 'WAL', logo: flag('gb-wls') },

  ARG: { id: 9, name: 'Argentina', tla: 'ARG', logo: flag('ar') },
  KSA: { id: 10, name: 'Saudi Arabia', tla: 'KSA', logo: flag('sa') },
  MEX: { id: 11, name: 'Mexico', tla: 'MEX', logo: flag('mx') },
  POL: { id: 12, name: 'Poland', tla: 'POL', logo: flag('pl') },

  FRA: { id: 13, name: 'France', tla: 'FRA', logo: flag('fr') },
  AUS: { id: 14, name: 'Australia', tla: 'AUS', logo: flag('au') },
  DEN: { id: 15, name: 'Denmark', tla: 'DEN', logo: flag('dk') },
  TUN: { id: 16, name: 'Tunisia', tla: 'TUN', logo: flag('tn') },

  ESP: { id: 17, name: 'Spain', tla: 'ESP', logo: flag('es') },
  CRC: { id: 18, name: 'Costa Rica', tla: 'CRC', logo: flag('cr') },
  GER: { id: 19, name: 'Germany', tla: 'GER', logo: flag('de') },
  JPN: { id: 20, name: 'Japan', tla: 'JPN', logo: flag('jp') },

  BEL: { id: 21, name: 'Belgium', tla: 'BEL', logo: flag('be') },
  CAN: { id: 22, name: 'Canada', tla: 'CAN', logo: flag('ca') },
  MAR: { id: 23, name: 'Morocco', tla: 'MAR', logo: flag('ma') },
  CRO: { id: 24, name: 'Croatia', tla: 'CRO', logo: flag('hr') },

  BRA: { id: 25, name: 'Brazil', tla: 'BRA', logo: flag('br') },
  SRB: { id: 26, name: 'Serbia', tla: 'SRB', logo: flag('rs') },
  SUI: { id: 27, name: 'Switzerland', tla: 'SUI', logo: flag('ch') },
  CMR: { id: 28, name: 'Cameroon', tla: 'CMR', logo: flag('cm') },

  POR: { id: 29, name: 'Portugal', tla: 'POR', logo: flag('pt') },
  GHA: { id: 30, name: 'Ghana', tla: 'GHA', logo: flag('gh') },
  URU: { id: 31, name: 'Uruguay', tla: 'URU', logo: flag('uy') },
  KOR: { id: 32, name: 'South Korea', tla: 'KOR', logo: flag('kr') },
};

export const team = (tla: keyof typeof WC_TEAMS): WCTeam => WC_TEAMS[tla];
