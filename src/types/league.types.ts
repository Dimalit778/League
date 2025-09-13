import { Tables } from './database.types';

export type leagueWithMembers = Tables<'leagues'> & {
  league_members: Tables<'league_members'>[];
  competition: Pick<
    Tables<'competitions'>,
    'id' | 'name' | 'logo' | 'country' | 'flag'
  >;
  owner: Tables<'league_members'>;
};
// League Types
export type createLeagueParams = {
  leagueName: string;
  nickname: string;
  user_id: string;
  competition_id: number;
  max_members: number;
  league_logo: string;
};
export type createLeagueResponse = {
  status: string;
  message: string;
  league_id: string;
};

// Join League Response Type
export type joinLeagueResponse = {
  league_id: string;
  league_name: string;
  message: string;
  success: boolean;
}[];
// Leave League Response Type
export type leaveLeagueResponse = any; // Returns Json from database
export type foundLeagueType = {
  id: string;
  name: string;
  join_code: string;
  max_members: number;
  league_members: number;
  competition_id: number;
  logo: string;
  country: string;
  flag: string;
  owner_id: string;
};
