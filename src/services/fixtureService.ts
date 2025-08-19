import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { FixtureWithTeams } from "@/types/fixturesTypes";


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
      .order("date", { ascending: true });
 
  
    if (error) throw error;
    return (data || []) as FixtureWithTeams[];
  },
  async getCompletedFixtures(competitionId?: number, limit = 10) {
    let query = supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        competition:competitions!fixtures_league_id_fkey(*)
      `)
      .not("goals_home", "is", null)
      .not("goals_away", "is", null)
      .order("date", { ascending: false })
      .limit(limit);

    if (competitionId) {
      query = query.eq("league_id", competitionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

 
};