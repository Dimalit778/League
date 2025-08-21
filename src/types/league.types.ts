import { Tables } from "./database.types";

export type CreateLeagueParams = {
  name: string;
  nickname: string;
  logo: string;
  owner_id: string;
  competition_id: number;
  max_members: number;
};

export type LeagueWithCompetition = Tables<'leagues'> & {
  competitions: Tables<'competitions'>;
};
export type MyLeagueType = {
  is_primary: boolean;
  id: string;
  name: string;
  join_code: string;
  logo: string;
  max_members: number;
  league_members: number;
  competition_id : number;
  
}
