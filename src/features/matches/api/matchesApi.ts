import { supabase } from "@/lib/supabase";
import {
  AiSummaryType,
  MatchDetails,
  MatchListItem,
  RawMatchListItem,
} from "../types";

const UPCOMING_MATCHES_LIMIT = 10;

const TEAM_LIST_FIELDS = `
  id,
  shortName,
  name,
  tla,
  "clubColors"
`;

export const MATCH_WITH_MEMBER_PREDICTION = `
  id,
  competition_id,
  fixture,
  kick_off,
  status,
  stage,
  group,
  home_team_id,
  away_team_id,
  score,

  home_team:teams!matches_home_team_id_fkey(${TEAM_LIST_FIELDS}),
  away_team:teams!matches_away_team_id_fkey(${TEAM_LIST_FIELDS}),

  predictions:predictions!predictions_match_id_fkey(
    id,
    match_id,
    league_member_id,
    home_score,
    away_score,
    points,
    is_finished
  )
`;
export const MATCH_WITH_ALL_PREDICTIONS = `
  id,
  competition_id,
  fixture,
  kick_off,
  status,
  stage,
  group,

  updated_at,
  home_team_id,
  away_team_id,
  score,
  ai_predicted_home_score,
  ai_predicted_away_score,
  ai_generated_at,

  home_team:teams!matches_home_team_id_fkey(
 ${TEAM_LIST_FIELDS}
  ),

  away_team:teams!matches_away_team_id_fkey(
 ${TEAM_LIST_FIELDS}
  ),
  competition:competitions!matches_competition_id_fkey(
    id,
    name
  ),

predictions:predictions!predictions_match_id_fkey(
  id,
  match_id,
  league_member_id,
  home_score,
  away_score,
  points,
  is_finished,
  league_member:league_members!predictions_league_member_id_fkey!inner(
    id,
    nickname,
    avatar_url
  )
)
`;
export function mapMatchCardData(data: unknown): MatchListItem[] {
  const rows = (data ?? []) as RawMatchListItem[];

  return rows.map(({ predictions, ...match }) => ({
    ...match,
    prediction: predictions?.[0] ?? null,
  }));
}

export const matchesApi = {
  // Get one match with all members' predictions
  async getMatchWithPredictions(
    leagueId: string,
    matchId: number,
  ): Promise<MatchDetails> {
    const { data, error } = await supabase
      .from("matches")
      .select(MATCH_WITH_ALL_PREDICTIONS)
      .eq("id", matchId)
      .eq("predictions.league_member.league_id", leagueId)
      .single<MatchDetails>();

    if (error) throw error;

    if (!data) throw new Error("Match not found");
    return data;
  },

  async getMatchAiSummary(matchId: number): Promise<AiSummaryType> {
    const { data, error } = await supabase.rpc("get_match_ai_summary", {
      p_match_id: matchId,
    }).single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("AI summary not found");

    return data;
  },

  //--->  MatchesScreen
  async getSeasonMatches(
    competitionId: number,
    seasonId: number,
    memberId: string,
  ): Promise<MatchListItem[]> {
    return this.getCompetitionMatchesWithMemberPredictions(
      competitionId,
      seasonId,
      memberId,
    );
  },

  // Get matches by fixture with current member's predictions
  async getMatchesByFixture({
    fixture,
    competitionId,
    seasonId,
    memberId,
    stage,
  }: {
    fixture: number;
    competitionId: number;
    seasonId: number;
    memberId: string;
    stage?: string;
  }): Promise<MatchListItem[]> {
    let query = supabase
      .from("matches")
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq("competition_id", competitionId)
      .eq("season_id", seasonId)
      .eq("fixture", fixture)
      .eq("predictions.league_member_id", memberId);

    if (stage) {
      query = query.eq("stage", stage);
    }

    const { data, error } = await query.order("kick_off", { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const matches = mapMatchCardData(data);

    return matches;
  },

  async getCompetitionMatchesWithMemberPredictions(
    competitionId: number,
    seasonId: number,
    memberId: string,
  ): Promise<MatchListItem[]> {
    const { data, error } = await supabase
      .from("matches")
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq("competition_id", competitionId)
      .eq("season_id", seasonId)
      .eq("predictions.league_member_id", memberId)
      .order("kick_off", { ascending: true });

    if (error) throw error;

    const matches = mapMatchCardData(data);
    return matches;
  },
  async getTodayMatches(
    competitionId: number,
    seasonId: number,
    memberId: string,
  ): Promise<MatchListItem[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("matches")
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq("competition_id", competitionId)
      .eq("season_id", seasonId)
      .gte("kick_off", startOfDay.toISOString())
      .lte("kick_off", endOfDay.toISOString())
      .eq("predictions.league_member_id", memberId)
      .order("kick_off", { ascending: true })
      .limit(UPCOMING_MATCHES_LIMIT);

    if (error) throw error;
    if (!data) return [];

    const matches = mapMatchCardData(data);
    return matches;
  },
};
