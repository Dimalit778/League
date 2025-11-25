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
type MemberLeagueType = MemberType & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};
type MemberProfileType = MemberType & {
  league: Tables<'leagues'> & {
    competition: Tables<'competitions'>;
  };
};
type leagueWithMembersType = Tables<'leagues'> & {
  league_members: Tables<'league_members'>[];
  competition: Tables<'competitions'>;
};

export type {
  leagueWithMembersType,
  MemberLeagueType,
  MemberPredictionType,
  MemberProfileType,
  MemberStatsType,
  MemberType,
};
