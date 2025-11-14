import { supabase } from '@/lib/supabase';

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
  async getMatchesWithPredictions(fixture: number, competitionId: number, userId: string) {
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
      .eq('predictions.user_id', userId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data;
  },
  async getMatches(fixture: number, competitionId: number, userId: string) {
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
      .eq('fixture', fixture)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    return data;
  },
  async getMatchesByMatchday(fixture: number, competitionId?: number) {
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
  async getMatchesWithMemberPredictions(fixture: number, competitionId: number, memberId: string) {
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `
      )
      .eq('competition_id', competitionId)
      .eq('fixture', fixture)
      .order('kick_off', { ascending: true });

    if (matchesError) throw matchesError;
    if (!matches || matches.length === 0) return [];

    const matchIds = matches.map((m) => m.id);
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_member_id', memberId)
      .in('match_id', matchIds);

    if (predictionsError) throw predictionsError;

    // Combine matches with their predictions
    const matchesWithPredictions = matches.map((match) => ({
      ...match,
      predictions: predictions?.filter((p) => p.match_id === match.id) || [],
    }));

    return matchesWithPredictions;
  },
};
