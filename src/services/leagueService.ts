import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

const FOOTBALL_API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY;

export const createLeague = async (leagueInput: {
  name: string;
  selected_league: string;
  admin_id: string;
}) => {
  try {
    const leagueCodes = {
      ENGLAND: "PL",
      SPAIN: "PD",
      GERMANY: "BL1",
      ITALY: "SA",
      FRANCE: "FL1",
    };

    const apiCode =
      leagueCodes[leagueInput.selected_league as keyof typeof leagueCodes];
    if (!apiCode) {
      return { data: null, error: { message: "Invalid league selected" } };
    }
    // Generate join code
    const join_code = generateRandomCode(6);
    // Create new league
    const { data: createdCompetition, error: errorCompetition } = await supabase
      .from("competitions")
      .insert({
        api_id: apiCode,
        name: leagueInput.selected_league,
        code: "PD",
        type: "league",
        emblem_url: "dgtrss",
        start_date: "",
        end_date: "",
        current_matchday: 3,
      })
      .select()
      .single();

    if (errorCompetition) {
      console.error("League creation error:", errorCompetition);
      return { data: null, error: errorCompetition };
    }

    return {
      data: {
        success: true,
        competition_id: createdCompetition.id,
        join_code,
      },
      error: null,
    };
  } catch (error) {
    console.error("Create league error:", error);
    return {
      data: null,
      error: { message: "An unexpected error occurred" },
    };
  }
};

// Helper function to generate random code
const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Fetch and save teams and matches in the background
const fetchAndSaveTeamsAndMatches = async (
  apiCode: string,
  seasonYear: number,
  league_id: string,
  base_league: string,
  supabase: SupabaseClient
) => {
  try {
    // Fetch teams
    const teamsRes = await fetch(
      `https://api.football-data.org/v4/competitions/${apiCode}/teams?season=${seasonYear}`,
      {
        headers: {
          "X-Auth-Token": FOOTBALL_API_KEY || "",
        },
      }
    );

    if (!teamsRes.ok) {
      throw new Error(`Teams API error: ${teamsRes.status}`);
    }

    const teamsJson = await teamsRes.json();

    if (!teamsJson.teams || !Array.isArray(teamsJson.teams)) {
      throw new Error("Invalid teams response from API");
    }

    const teams = teamsJson.teams.map((team: any) => ({
      id: team.id,
      name: team.name,
      logo_url: team.crest,
      league: base_league,
    }));

    await supabase.from("teams").upsert(teams);

    // Fetch matches
    const matchesRes = await fetch(
      `https://api.football-data.org/v4/competitions/${apiCode}/matches?season=${seasonYear}`,
      {
        headers: {
          "X-Auth-Token": FOOTBALL_API_KEY || "",
        },
      }
    );

    if (!matchesRes.ok) {
      throw new Error(`Matches API error: ${matchesRes.status}`);
    }

    const matchesJson = await matchesRes.json();

    if (!matchesJson.matches || !Array.isArray(matchesJson.matches)) {
      throw new Error("Invalid matches response from API");
    }

    // Group matches by round
    const matches = matchesJson.matches.map((match: any) => ({
      id: match.id,
      round_number: match.matchday,
      home_team_id: match.homeTeam.id,
      away_team_id: match.awayTeam.id,
      match_date: match.utcDate,
      league_id,
      home_score: match.score.fullTime.home ?? null,
      away_score: match.score.fullTime.away ?? null,
    }));

    // Save rounds
    const uniqueRounds = [
      ...new Set(matches.map((m: any) => m.round_number)),
    ].map((rn: any) => ({
      league_id,
      round_number: rn,
    }));

    await supabase.from("rounds").insert(uniqueRounds);
    await supabase.from("matches").insert(matches);
  } catch (error) {
    console.error("Error fetching teams and matches:", error);
    // Continue execution even if API calls fail
  }
};

export const joinLeague = async (
  leagueId: string,
  userId: string,
  nickname: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("league_members")
    .insert({
      league_id: leagueId,
      user_id: userId,
      nickname,
    })
    .select()
    .single();

  return { data, error };
};

export const getLeagueMatches = async (
  league: string,
  supabase: SupabaseClient
) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("league", league)
    .gte("kickoff", new Date().toISOString())
    .order("kickoff", { ascending: true });

  return { data, error };
};
