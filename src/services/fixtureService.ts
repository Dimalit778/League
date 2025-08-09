import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";

type Fixture = Tables<"fixtures">;
type Team = Tables<"teams">;
type Competition = Tables<"competitions">;

export const fixtureService = {
  async getFixtures(competitionId?: number, season?: number) {
    let query = supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        competition:competitions!fixtures_league_id_fkey(*)
      `);

    if (competitionId) {
      query = query.eq("league_id", competitionId);
    }

    if (season) {
      query = query.eq("season", season);
    }

    const { data, error } = await query.order("date", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getFixtureById(id: number) {
    const { data, error } = await supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        competition:competitions!fixtures_league_id_fkey(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUpcomingFixtures(competitionId?: number, limit = 10) {
    let query = supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        competition:competitions!fixtures_league_id_fkey(*)
      `)
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(limit);

    if (competitionId) {
      query = query.eq("league_id", competitionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getFixturesByRound(competitionId: number, round: string, season?: number) {
    let query = supabase
      .from("fixtures")
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*),
        competition:competitions!fixtures_league_id_fkey(*)
      `)
      .eq("league_id", competitionId)
      .eq("round", round);

    if (season) {
      query = query.eq("season", season);
    }

    const { data, error } = await query.order("date", { ascending: true });

    if (error) throw error;
    return data;
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

  async getRounds(competitionId: number, season?: number) {
    let query = supabase
      .from("fixtures")
      .select("round")
      .eq("league_id", competitionId);

    if (season) {
      query = query.eq("season", season);
    }

    const { data, error } = await query;

    if (error) throw error;

    const uniqueRounds = [...new Set(data.map(fixture => fixture.round))];
    return uniqueRounds.sort();
  }
};