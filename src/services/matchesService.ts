import { supabase } from '@/lib/supabase';
import {
  MatchesWithTeamsAndPredictionsType,
  MatchesWithTeamsType,
} from '@/types';

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
  ): Promise<MatchesWithTeamsAndPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        predictions(*)
      `
      )
      .eq('competition_id', competitionId)
      .eq('matchday', matchday)
      .eq('predictions.user_id', userId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data as MatchesWithTeamsAndPredictionsType[];
  },
  async getMatchesByMatchday(
    matchday: number,
    competitionId?: number
  ): Promise<MatchesWithTeamsType[]> {
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

    return data as MatchesWithTeamsType[];
  },
};
