import { Tables } from './database.types';
// App Types
export type IconProps = {
  color?: string;
  size?: number;
};

export type LeagueWithCompetitionType = Tables<'leagues'> & {
  competition: Tables<'competitions'>;
};
export type LeagueWithCompetitionAndMembersCountType = Tables<'leagues'> & {
  competition: Tables<'competitions'>;
  league_members: { count: number }[];
};

export type LeagueWithMembersType = Tables<'leagues'> & {
  league_members: Tables<'league_members'>[];
  competition: Pick<Tables<'competitions'>, 'id' | 'name' | 'logo' | 'area' | 'flag'>;
};

export type LeaderboardAndMemberType = Tables<'predictions'> & {
  member: Tables<'league_members'>;
};
