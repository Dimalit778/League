import { Tables } from '@/types/database.types';

type MemberPredictionType = Tables<'predictions'> & {
  member: Tables<'league_members'>;
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
type MemberLeagueType = Tables<'league_members'> & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};
type MemberProfileType = Tables<'league_members'> & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};
type leagueWithMembersType = Tables<'leagues'> & {
  league_members: Tables<'league_members'>[];
  competition: Tables<'competitions'>;
};

export type { leagueWithMembersType, MemberLeagueType, MemberPredictionType, MemberProfileType, MemberStatsType };
