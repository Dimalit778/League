import axios from "axios";
import {
  FootballDataResponse,
  FootballDataMatch,
  FootballLeague,
} from "../types";
import { supabase } from "./supabase";

const FOOTBALL_API_KEY = "YOUR_FOOTBALL_DATA_API_KEY";
const BASE_URL = "https://api.football-data.org/v4";

// League mapping to Football Data API competition IDs
const LEAGUE_IDS: Record<FootballLeague, string> = {
  premier_league: "2021",
  la_liga: "2014",
  bundesliga: "2002",
  serie_a: "2019",
  ligue_1: "2015",
};

const footballApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Auth-Token": FOOTBALL_API_KEY,
  },
});

/**
 * Fetch upcoming matches for a specific league
 */
export const fetchUpcomingMatches = async (
  league: FootballLeague,
  days: number = 7
) => {
  try {
    const competitionId = LEAGUE_IDS[league];
    const dateFrom = new Date().toISOString().split("T")[0];
    const dateTo = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const response = await footballApi.get<FootballDataResponse>(
      `/competitions/${competitionId}/matches`,
      {
        params: {
          dateFrom,
          dateTo,
          status: "SCHEDULED",
        },
      }
    );

    return {
      data: response.data.matches,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching matches:", error);
    return {
      data: [],
      error: error as Error,
    };
  }
};

/**
 * Fetch finished matches for result updates
 */
export const fetchFinishedMatches = async (
  league: FootballLeague,
  days: number = 3
) => {
  try {
    const competitionId = LEAGUE_IDS[league];
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const dateTo = new Date().toISOString().split("T")[0];

    const response = await footballApi.get<FootballDataResponse>(
      `/competitions/${competitionId}/matches`,
      {
        params: {
          dateFrom,
          dateTo,
          status: "FINISHED",
        },
      }
    );

    return {
      data: response.data.matches,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching finished matches:", error);
    return {
      data: [],
      error: error as Error,
    };
  }
};

/**
 * Transform Football Data API match to our database format
 */
export const transformMatchData = (
  match: FootballDataMatch,
  league: FootballLeague
) => {
  return {
    id: match.id,
    home_team: match.homeTeam.name,
    away_team: match.awayTeam.name,
    league,
    kickoff: match.utcDate,
    status: match.status.toLowerCase() as "scheduled" | "live" | "finished",
    home_score: match.score.fullTime.home,
    away_score: match.score.fullTime.away,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Sync matches with local database
 */
export const syncMatchesToDatabase = async (league: FootballLeague) => {
  try {
    // Fetch upcoming matches
    const { data: upcomingMatches, error: upcomingError } =
      await fetchUpcomingMatches(league);
    if (upcomingError) throw upcomingError;

    // Fetch finished matches for result updates
    const { data: finishedMatches, error: finishedError } =
      await fetchFinishedMatches(league);
    if (finishedError) throw finishedError;

    const allMatches = [...upcomingMatches, ...finishedMatches];
    const transformedMatches = allMatches.map((match) =>
      transformMatchData(match, league)
    );

    // Upsert matches to database
    const { error: upsertError } = await supabase
      .from("matches")
      .upsert(transformedMatches, { onConflict: "id" });

    if (upsertError) throw upsertError;

    console.log(`Synced ${transformedMatches.length} matches for ${league}`);
    return { success: true, count: transformedMatches.length };
  } catch (error) {
    console.error("Error syncing matches:", error);
    return { success: false, error: error as Error };
  }
};

/**
 * Calculate points for predictions based on actual results
 */
export const calculatePredictionPoints = (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number => {
  // Exact score match - 3 points
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }

  // Correct winner - 1 point
  const predictedResult =
    predictedHome > predictedAway
      ? "home"
      : predictedHome < predictedAway
      ? "away"
      : "draw";
  const actualResult =
    actualHome > actualAway
      ? "home"
      : actualHome < actualAway
      ? "away"
      : "draw";

  if (predictedResult === actualResult) {
    return 1;
  }

  // Wrong prediction - 0 points
  return 0;
};

/**
 * Update prediction points after match results are available
 */
export const updatePredictionPoints = async (matchId: number) => {
  try {
    // Get match result
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .eq("status", "finished")
      .single();

    if (
      matchError ||
      !match ||
      match.home_score === null ||
      match.away_score === null
    ) {
      throw new Error("Match not finished or scores not available");
    }

    // Get all predictions for this match
    const { data: predictions, error: predictionsError } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", matchId);

    if (predictionsError) throw predictionsError;

    // Calculate points for each prediction
    const updatedPredictions = predictions.map((prediction) => ({
      ...prediction,
      points: calculatePredictionPoints(
        prediction.home_score,
        prediction.away_score,
        match.home_score,
        match.away_score
      ),
    }));

    // Update predictions with calculated points
    const { error: updateError } = await supabase
      .from("predictions")
      .upsert(updatedPredictions);

    if (updateError) throw updateError;

    console.log(
      `Updated points for ${updatedPredictions.length} predictions for match ${matchId}`
    );
    return { success: true, count: updatedPredictions.length };
  } catch (error) {
    console.error("Error updating prediction points:", error);
    return { success: false, error: error as Error };
  }
};

/**
 * Get league information
 */
export const getLeagueInfo = (league: FootballLeague) => {
  const leagueMap = {
    premier_league: {
      id: "premier_league" as FootballLeague,
      name: "Premier League",
      country: "England",
      apiCode: "2021",
      color: "#3D195B",
    },
    la_liga: {
      id: "la_liga" as FootballLeague,
      name: "La Liga",
      country: "Spain",
      apiCode: "2014",
      color: "#FF6B00",
    },
    bundesliga: {
      id: "bundesliga" as FootballLeague,
      name: "Bundesliga",
      country: "Germany",
      apiCode: "2002",
      color: "#D20515",
    },
    serie_a: {
      id: "serie_a" as FootballLeague,
      name: "Serie A",
      country: "Italy",
      apiCode: "2019",
      color: "#008FD7",
    },
    ligue_1: {
      id: "ligue_1" as FootballLeague,
      name: "Ligue 1",
      country: "France",
      apiCode: "2015",
      color: "#FF1E00",
    },
  };

  return leagueMap[league];
};
