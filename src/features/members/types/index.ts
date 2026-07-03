import { Tables } from '@/types/database.types';

type MemberType = Tables<'league_members'>;

type MemberPredictionType = Tables<'predictions'> & {
  member: MemberType;
};
type RoundPerformance = {
  round: number;
  points: number;
};
type PredictionRow = {
  points: number | null;
  is_finished: boolean;
  matches: { fixture: number | null; kick_off: string } | null;
};


type BestCategory = {
  name: string;
  value: number;
  topPercent: number | null;
};

type MemberStatsType = {
  totalPredictions: number;
  bingoHits: number;
  regularHits: number;
  missedHits: number;
  accuracy: number;
  totalPoints: number;
  position?: number | null;
  currentStreak?: number;
  longestStreak?: number;
  roundPerformance?: RoundPerformance[];
  bestCategory?: BestCategory;
};
// Member with league and competition
type MemberLeagueType = Tables<'league_members'> & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};
type MemberProfileType = MemberType & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};


export type {
  BestCategory,
  MemberLeagueType,
  MemberPredictionType,
  MemberProfileType,
  MemberStatsType,
  MemberType,
  PredictionRow,
  RoundPerformance
};

