import { supabase } from '@/lib/supabase';
import { MatchWithPredictions, MatchWithPredictionsType } from '../types';

export const matchesApi = {
  // async getMatch(matchId: number): Promise<MatchType> {
  //   const { data, error } = await supabase
  //     .from('matches')
  //     .select(
  //       `
  //       *,
  //       home_team:teams!matches_home_team_id_fkey(*),
  //       away_team:teams!matches_away_team_id_fkey(*)

  //     `
  //     )
  //     .eq('id', matchId)
  //     .single();

  //   if (error) throw error;

  //   return data as MatchType;
  // },

  // async getMatchesByFixture(fixture: number, competitionId?: number): Promise<MatchType[]> {
  //   const { data, error } = await supabase
  //     .from('matches')
  //     .select(
  //       `
  //       *,
  //       home_team:teams!matches_home_team_id_fkey(*),
  //       away_team:teams!matches_away_team_id_fkey(*)
  //       `
  //     )
  //     .eq('competition_id', competitionId!)
  //     .eq('fixture', fixture)
  //     .order('kick_off', { ascending: true });

  //   if (error) throw error;

  //   return data as MatchType[];
  // },
  // Get One match with Members predictions
  async getMatchWithPredictions(leagueId: string, matchId: number): Promise<MatchWithPredictions> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        predictions:predictions!predictions_match_id_fkey(
          *,
          league_member:league_members!predictions_league_member_id_fkey(
            id,
            league_id,
            user_id,
            nickname,
            avatar_url,
            is_primary
          )
        )
      `
      )
      .eq('id', matchId)
      .eq('predictions.league_member.league_id', leagueId)
      .single<MatchWithPredictions>();

    if (error) throw error;
    if (!data) throw new Error('Match not found');
    return data;
  },
  // Get matches by fixture with current Member predictions
  async getMatchesByFixtureWithMemberPredictions(
    fixture: number,
    competitionId: number,
    memberId: string
  ): Promise<MatchWithPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        predictions:predictions!predictions_match_id_fkey(*)
      `
      )
      .eq('competition_id', competitionId)
      .eq('fixture', fixture)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data as MatchWithPredictionsType[];
  },
};
