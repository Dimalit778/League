import { supabase } from '@/lib/supabase';
import { MatchWithPredictions, MatchWithPredictionsType } from '../types';
import { FIRST_PHASE_STAGES } from '../types/footballStages';
import { prefetchMatchTeamLogos, prefetchTeamLogos } from '../utils/prefetchTeamLogos';
import { KNOCKOUT_STAGE_VALUES, TournamentView } from '../utils/tournamentMatches';

const MATCHES_WITH_MEMBER_PREDICTION_SELECT = `
  *,
  home_team:teams!matches_home_team_id_fkey(*),
  away_team:teams!matches_away_team_id_fkey(*),
  predictions:predictions!predictions_match_id_fkey(*)
`;

const withMemberPredictions = (
  matches: MatchWithPredictionsType[] | null,
  memberId: string,
): MatchWithPredictionsType[] =>
  (matches ?? []).map((match) => ({
    ...match,
    predictions: (match.predictions ?? []).filter((prediction) => prediction.league_member_id === memberId),
  }));

export const matchesApi = {
  // Get One match with all Members predictions
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
      `,
      )
      .eq('id', matchId)
      .eq('predictions.league_member.league_id', leagueId)
      .single<MatchWithPredictions>();

    if (error) throw error;
    if (!data) throw new Error('Match not found');
    void prefetchMatchTeamLogos(data);
    return data;
  },
  // Get matches by fixture with current Member predictions
  async getFixtureMatchesWithMemberPrediction({
    fixture,
    competitionId,
    memberId,
    stage,
  }: {
    fixture: number;
    competitionId: number;
    memberId: string;
    stage?: string;
  }): Promise<MatchWithPredictionsType[]> {
    let query = supabase
      .from('matches')
      .select(MATCHES_WITH_MEMBER_PREDICTION_SELECT)
      .eq('competition_id', competitionId)
      .eq('fixture', fixture);

    if (stage) {
      query = query.eq('stage', stage);
    }

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = withMemberPredictions(data as MatchWithPredictionsType[], memberId);
    void prefetchTeamLogos(matches);

    return matches;
  },
  // Get all competition matches with current Member predictions
  async getCompetitionMatchesWithMemberPredictions(
    competitionId: number,
    memberId: string,
  ): Promise<MatchWithPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCHES_WITH_MEMBER_PREDICTION_SELECT)
      .eq('competition_id', competitionId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = withMemberPredictions(data as MatchWithPredictionsType[], memberId);
    void prefetchTeamLogos(matches);

    return matches;
  },

  async getTournamentMatches(
    competitionId: number,
    memberId: string,
    stage: string,
  ): Promise<MatchWithPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCHES_WITH_MEMBER_PREDICTION_SELECT)
      .eq('competition_id', competitionId)
      .eq('stage', stage)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = withMemberPredictions(data as MatchWithPredictionsType[], memberId);
    void prefetchTeamLogos(matches);

    return matches;
  },

  async getTournamentMatchesByView(
    competitionId: number,
    memberId: string,
    view: TournamentView,
  ): Promise<MatchWithPredictionsType[]> {
    let query = supabase
      .from('matches')
      .select(MATCHES_WITH_MEMBER_PREDICTION_SELECT)
      .eq('competition_id', competitionId);

    query = view === 'groups' ? query.in('stage', FIRST_PHASE_STAGES) : query.in('stage', KNOCKOUT_STAGE_VALUES);

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = withMemberPredictions(data as MatchWithPredictionsType[], memberId);
    void prefetchTeamLogos(matches);

    return matches;
  },
  async getTournamentActiveStage(competitionId: number): Promise<{ activeStage: string | null }> {
    const { data, error } = await supabase
      .from('matches')
      .select('stage')
      .eq('competition_id', competitionId)
      .neq('status', 'FINISHED')
      .order('kick_off', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      activeStage: data?.stage ?? null,
    };
  },
  // Get member finished matches by fixture
  async getMemberFinishedMatches(
    memberId: string,
    competitionId: number,
    fixture?: number,
  ): Promise<MatchWithPredictionsType[]> {
    let query = supabase
      .from('matches')
      .select(MATCHES_WITH_MEMBER_PREDICTION_SELECT)
      .eq('competition_id', competitionId)
      .eq('status', 'FINISHED');

    if (fixture !== undefined) {
      query = query.eq('fixture', fixture);
    }

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];
    return withMemberPredictions(data as MatchWithPredictionsType[], memberId);
  },
};
