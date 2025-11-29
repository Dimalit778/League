import { Tables } from '@/types/database.types';

type MemberType = Tables<'league_members'>;

type MemberPredictionType = Tables<'predictions'> & {
  member: MemberType;
};
type MemberStatsType = {
  totalPredictions: number;
  bingoHits: number;
  regularHits: number;
  missedHits: number;
  accuracy: number;
  totalPoints: number;
  position?: number | null;
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

export type { MemberLeagueType, MemberPredictionType, MemberProfileType, MemberStatsType, MemberType };
