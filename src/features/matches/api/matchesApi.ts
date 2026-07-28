import { supabase } from '@/lib/supabase';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { MatchCardRawType, MatchCardType, MatchWithAllPredictionsType } from '../types';

const TEAM_LIST_FIELDS = `
  id,
  shortName,
  name,
  logo,
  tla
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
  ai_summary_en,
  ai_summary_he,
  ai_predicted_home_score,
  ai_predicted_away_score,

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
  home_team_id,
  away_team_id,
  score,
  ai_summary_en,
  ai_summary_he,
  ai_predicted_home_score,
  ai_predicted_away_score,

  home_team:teams!matches_home_team_id_fkey(
 ${TEAM_LIST_FIELDS}
  ),

  away_team:teams!matches_away_team_id_fkey(
 ${TEAM_LIST_FIELDS}
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
export function mapMatchCardData(data: unknown): MatchCardType[] {
  const rows = (data ?? []) as MatchCardRawType[];

  return rows.map(({ predictions, ...match }) => ({
    ...match,
    prediction: predictions?.[0] ?? null,
  }));
}

/**
 * All match queries. `getSeasonMatches` loads the whole competition once;
 * every Matches view slices it client-side (see model/selectors, model/knockout).
 */
export const matchesApi = {
  // Get one match with all members' predictions
  async getMatchWithPredictions(
    leagueId: string,
    matchId: number,
  ): Promise<MatchWithAllPredictionsType> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_ALL_PREDICTIONS)
      .eq('id', matchId)
      .eq('predictions.league_member.league_id', leagueId)
      .single<MatchWithAllPredictionsType>();
 
    if (error) throw error;

    if (!data) throw new Error('Match not found');
    void prefetchMatchTeamLogos([data]);
    return data;
  },

 //--->  MatchesScreen
  async getSeasonMatches(
    competitionId: number,
    seasonId: number,
    memberId: string,
  ): Promise<MatchCardType[]> {
    return this.getCompetitionMatchesWithMemberPredictions(competitionId, seasonId, memberId);
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
  }): Promise<MatchCardType[]> {
    let query = supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('season_id', seasonId)
      .eq('fixture', fixture)
      .eq('predictions.league_member_id', memberId);

    if (stage) {
      query = query.eq('stage', stage);
    }

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const matches = mapMatchCardData(data);

    void prefetchMatchTeamLogos(matches);
    return matches;
  },

  async getCompetitionMatchesWithMemberPredictions(
    competitionId: number,
    seasonId: number,
    memberId: string,
  ): Promise<MatchCardType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('season_id', seasonId)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = mapMatchCardData(data);
    void prefetchMatchTeamLogos(matches);
    return matches;
  },
  async getTodayMatches(
    competitionId: number,
    seasonId: number,
    memberId: string,
  ): Promise<MatchCardType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('season_id', seasonId)
      .gte('kick_off', new Date().toISOString())
      .lte('kick_off', new Date().toISOString())
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const matches = mapMatchCardData(data);
    void prefetchMatchTeamLogos(matches);

    return matches;
  },
};
