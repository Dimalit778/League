import { supabase } from '@/lib/supabase';
import { MatchesWithTeams, MatchesWithTeamsAndPredictions } from '@/types';

export const matchesService = {
  async getMatchById(id: number) {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
  
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  },
  async getMatchesWithPredictions(
    matchday: number,
    competitionId: number,
    userId: string
  ): Promise<MatchesWithTeamsAndPredictions[]> {
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
      .eq('matchday', matchday)
      .eq('predictions.user_id', userId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data as MatchesWithTeamsAndPredictions[];
  },
  async getMatches(
    matchday: number,
    competitionId: number,
    userId: string
  ): Promise<MatchesWithTeams[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `
      )
      .eq('competition_id', competitionId)
      .eq('matchday', matchday)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data as MatchesWithTeams[];
  },
  async getMatchesByMatchday(
    matchday: number,
    competitionId?: number
  ): Promise<MatchesWithTeams[]> {
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
      .eq('matchday', matchday)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data as MatchesWithTeams[];
  },
};
