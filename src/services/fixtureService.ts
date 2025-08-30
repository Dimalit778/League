import { supabase } from "@/lib/supabase";
import { FixturesWithTeamsAndPredictionsType, FixturesWithTeamsType } from "@/types";




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
  async getFixturesWithPredictions(round: string, competitionId: number, userId: string): Promise<FixturesWithTeamsAndPredictionsType[]> {
    console.log('fetching fixtures with predictions ----');
    const { data, error } = await supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        predictions(*)
      `)
      .eq("competition_id", competitionId)
      .eq("round", round)
      .eq("predictions.user_id", userId)
      .order("kickoff_time", { ascending: true });
 

    if (error) throw error;

    return data as FixturesWithTeamsAndPredictionsType[];
  },
  async getFixturesByRound(
    round: string,
    competitionId?:  number,
  ): Promise<FixturesWithTeamsType[]> {
  
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
    
    return data as FixturesWithTeamsType[];
  },

};