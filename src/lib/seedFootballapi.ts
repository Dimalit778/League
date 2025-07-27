import { supabase } from "@/lib/supabase";

const COMPETITION_CODE = "PD";
const FOOTBALL_API_URL = `https://api.football-data.org/v4/competitions/${COMPETITION_CODE}/matches`;
const FOOTBALL_API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY;

interface ApiCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}
interface ApiSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner: any; // Can be null
}
interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
  competition: ApiCompetition;
  season: ApiSeason; // Added season info to the match object
}
interface ApiResponse {
  competition: ApiCompetition;
  matches: ApiMatch[];
  resultSet: {
    first: string; // The start date of the overall season/matches returned
    last: string; // The end date of the overall season/matches returned
  };
}

const fetchMatchesFromApi = async (): Promise<ApiResponse | null> => {
  try {
    const response = await fetch(FOOTBALL_API_URL, {
      headers: {
        "X-Auth-Token": FOOTBALL_API_KEY!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return null;
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from football-data.org API:", error);
    return null;
  }
};
export const syncFootballData = async () => {
  const apiData = await fetchMatchesFromApi();
  console.log("apiData ---", JSON.stringify(apiData, null, 2));
  if (!apiData) {
    console.log("Failed to fetch API data. Exiting sync.");
    return;
  }

  const { competition, matches, resultSet } = apiData;
  console.log("--------------------------------");
  console.log("competition ---", JSON.stringify(competition, null, 2));
  console.log("matches ---", JSON.stringify(matches, null, 2));
  console.log("resultSet ---", JSON.stringify(resultSet, null, 2));

  // --- 1. Upsert the League Information ---
  console.log(`Syncing league: ${competition.name}`);

  let competitionDbId: string;

  const { data: existingCompetition, error: fetchCompError } = await supabase
    .from("competitions")
    .select("id")
    .eq("api_competition_id", competition.id)
    .single();
  console.log(
    "existingCompetition ---",
    JSON.stringify(existingCompetition, null, 2)
  );
  if (fetchCompError && fetchCompError.code !== "PGRST116") {
    // PGRST116 means "no rows found"
    console.error("Error fetching existing competition:", fetchCompError);
    return;
  }

  // Extract season start/end dates from the first match's season or resultSet
  // Using resultSet dates for the overall competition season
  const competitionSeasonData = {
    start_date: resultSet.first,
    end_date: resultSet.last,
    current_matchday: matches[0]?.season?.currentMatchday || null, // Use first match's currentMatchday, or null if no matches
  };
  console.log(
    "competition-season-data ---",
    JSON.stringify(competitionSeasonData, null, 2)
  );
  if (existingCompetition) {
    competitionDbId = existingCompetition.id;
    console.log("competitionDbId ---", competitionDbId);
    // Update existing competition details if they can change
    const { error: updateCompError } = await supabase
      .from("competitions")
      .update({
        name: competition.name,
        code: competition.code,
        type: competition.type,
        emblem_url: competition.emblem,
        start_date: competitionSeasonData.start_date,
        end_date: competitionSeasonData.end_date,
        current_matchday: competitionSeasonData.current_matchday,
      })
      .eq("id", competitionDbId);
    console.log(
      "updateCompError ---",
      JSON.stringify(updateCompError, null, 2)
    );

    if (updateCompError) {
      console.error("Error updating competition:", updateCompError);
    } else {
      console.log(`Updated competition: ${competition.name}`);
    }
  } else {
    console.log("inserting new competition");
    // Insert new competition
    const { data: newCompetition, error: insertCompError } = await supabase
      .from("competitions")
      .insert({
        api_competition_id: competition.id,
        name: competition.name,
        code: competition.code,
        type: competition.type,
        emblem_url: competition.emblem,
        start_date: competitionSeasonData.start_date,
        end_date: competitionSeasonData.end_date,
        current_matchday: competitionSeasonData.current_matchday || null,
      })
      .select("id")
      .single();
    console.log("newCompetition ---", JSON.stringify(newCompetition, null, 2));
    if (insertCompError) {
      console.error("Error inserting new competition:", insertCompError);
      return;
    }
    competitionDbId = newCompetition.id;
    console.log(
      `Inserted new competition: "${competition.name}" with ID: ${competitionDbId}`
    );
  }
  console.log("--- 2. Iterate and Upsert Matches --- ---");
  // --- 2. Iterate and Upsert Matches ---
  console.log(`Syncing ${matches.length} matches for ${competition.name}...`);
  for (const apiMatch of matches) {
    console.log("apiMatch ---", JSON.stringify(apiMatch, null, 2));
    try {
      // Check if match already exists using api_match_id
      const { data: existingMatch, error: fetchMatchError } = await supabase
        .from("matches")
        .select("id, status, home_score, away_score") // Select current status/score to compare
        .eq("api_match_id", apiMatch.id)
        .single();
      console.log("existingMatch ---", JSON.stringify(existingMatch, null, 2));
      if (fetchMatchError && fetchMatchError.code !== "PGRST116") {
        console.error(
          `Error fetching existing match ${apiMatch.id}:`,
          fetchMatchError
        );
        continue; // Skip to next match
      }
      console.log("matchData ---");
      const matchData = {
        competition_id: competitionDbId, // Link to the new competitions table UUID
        home_team: apiMatch.homeTeam.name,
        away_team: apiMatch.awayTeam.name,
        match_date: apiMatch.utcDate,
        match_day: apiMatch.matchday,
        status: apiMatch.status,
        home_score: apiMatch.score.fullTime.home,
        away_score: apiMatch.score.fullTime.away,
        api_match_id: apiMatch.id,
      };
      console.log("matchData ---", JSON.stringify(matchData, null, 2));
      if (existingMatch) {
        // Only update if relevant fields have changed
        const shouldUpdate =
          existingMatch.status !== matchData.status ||
          existingMatch.home_score !== matchData.home_score ||
          existingMatch.away_score !== matchData.away_score;

        if (shouldUpdate) {
          const { error: updateError } = await supabase
            .from("matches")
            .update(matchData)
            .eq("id", existingMatch.id);
          console.log("updateError ---", JSON.stringify(updateError, null, 2));
          if (updateError) {
            console.error(`Error updating match ${apiMatch.id}:`, updateError);
          } else {
            console.log(
              `Updated match: ${apiMatch.homeTeam.name} vs ${apiMatch.awayTeam.name}`
            );
          }
        } else {
          // console.log(`Match ${apiMatch.id} unchanged. Skipping update.`);
        }
      } else {
        // Insert new match
        const { error: insertError } = await supabase
          .from("matches")
          .insert(matchData);
        console.log("insertError ---", JSON.stringify(insertError, null, 2));
        if (insertError) {
          console.error(`Error inserting match ${apiMatch.id}:`, insertError);
        } else {
          console.log(
            `Inserted new match: ${apiMatch.homeTeam.name} vs ${apiMatch.awayTeam.name}`
          );
        }
      }
    } catch (matchProcessingError) {
      console.error(
        `Unhandled error processing match ${apiMatch.id}:`,
        matchProcessingError
      );
    }
  }
  console.log("Football data sync complete.");
};
