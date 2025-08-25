import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";


// Type for when teams are guaranteed to exist
type FixturesWithTeams = Tables<"fixtures"> & {
  home_team: Tables<"teams">;
  away_team: Tables<"teams">;
};

export const fixtureService = {
 
  async getFixtureById(id: number) {
    const { data, error } = await supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
   
    return data;
  },
  async getFixturesByRound(
    round: string,
    competitionId?:  number,
  ): Promise<FixturesWithTeams[]> {
  
  const {data, error} = await supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .eq("competition_id", competitionId!)
      .eq("round", round)
      .order("kickoff_time", { ascending: true });
 
  
    if (error) throw error;
    return data;
  },

};