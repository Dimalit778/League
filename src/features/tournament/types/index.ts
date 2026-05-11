export type WCStage = 'GROUP_STAGE' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
export type WCKnockoutStage = Exclude<WCStage, 'GROUP_STAGE'>;
export type WCGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type WCMatchday = 1 | 2 | 3;

export type WCTeam = {
  id: number;
  name: string;
  tla: string;
  logo: string;
};

export type WCPrediction = {
  home: number;
  away: number;
  points: number | null;
};

export type WCMatch = {
  id: number;
  stage: WCStage;
  group?: WCGroup;
  matchday?: WCMatchday;
  kick_off: string;
  status: 'SCHEDULED' | 'FINISHED';
  home_team: WCTeam;
  away_team: WCTeam;
  home_score: number | null;
  away_score: number | null;
  user_prediction?: WCPrediction;
};

export type WCStandingRow = {
  team: WCTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export type WCLeaderboardMember = {
  member_id: string;
  nickname: string;
  avatar_url: string | null;
  total_points: number;
  is_current_user?: boolean;
};

export type WCCompetition = {
  id: number;
  name: string;
  area: string;
  flag: string;
  logo: string;
};
