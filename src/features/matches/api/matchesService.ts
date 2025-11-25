import { supabase } from '@/lib/supabase';
import { MatchWithPredictionsAndMemberType } from '../types';

export const matchesApi = {
  async getMatch(matchId: number) {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
  
      `
      )
      .eq('id', matchId)
      .single();

    if (error) throw error;

    return data;
  },

  async getMatchesByFixture(fixture: number, competitionId?: number) {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
        `
      )
      .eq('competition_id', competitionId!)
      .eq('fixture', fixture)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data;
  },

  async getMatchWithPredictions(matchId: number, leagueId: string): Promise<MatchWithPredictionsAndMemberType> {
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
      .single();

    if (error) throw error;
    if (!data) throw new Error('Match not found');
    return data as MatchWithPredictionsAndMemberType;
  },
  async getMatchesByFixtureWithMemberPredictions(fixture: number, competitionId: number, memberId: string) {
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

    return data;
  },
};
