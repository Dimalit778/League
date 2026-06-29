import { supabase } from '@/lib/supabase';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { MatchWithPredictions, MatchWithPredictionsType } from '../types';
import { FIRST_PHASE_STAGES } from '../types/footballStages';
import {
  KNOCKOUT_STAGE_VALUES,
  TournamentView,
} from '../utils/tournamentMatches';

const MATCH_LIST_FIELDS = `
  id,
  kick_off,
  status,
  score,
  fixture,
  stage,
  group,
  home_team_id,
  away_team_id,
  competition_id
`;

const TEAM_LIST_FIELDS = 'id, shortName, name, logo, crest, tla';

const MEMBER_PREDICTION_FIELDS = 'match_id, home_score, away_score, points, is_finished, league_member_id';

const buildMatchListSelect = () => `
  ${MATCH_LIST_FIELDS},
  home_team:teams!matches_home_team_id_fkey(${TEAM_LIST_FIELDS}),
  away_team:teams!matches_away_team_id_fkey(${TEAM_LIST_FIELDS})
`;

type MatchListRow = Omit<MatchWithPredictionsType, 'predictions'>;

const attachMemberPredictions = async (
  matches: MatchListRow[],
  memberId: string,
): Promise<MatchWithPredictionsType[]> => {
  if (matches.length === 0) return [];

  const matchIds = matches.map((match) => match.id);
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select(MEMBER_PREDICTION_FIELDS)
    .eq('league_member_id', memberId)
    .in('match_id', matchIds);

  if (error) throw error;

  const predictionsByMatchId = new Map<number, MatchWithPredictionsType['predictions']>();
  for (const prediction of predictions ?? []) {
    const existing = predictionsByMatchId.get(prediction.match_id) ?? [];
    existing.push(prediction as MatchWithPredictionsType['predictions'][number]);
    predictionsByMatchId.set(prediction.match_id, existing);
  }

  return matches.map((match) => ({
    ...match,
    predictions: predictionsByMatchId.get(match.id) ?? [],
  }));
};

export const matchesApi = {
  // Get One match with all Members predictions
  async getMatchWithPredictions(
    leagueId: string,
    matchId: number,
  ): Promise<MatchWithPredictions> {
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
      .select(buildMatchListSelect())
      .eq('competition_id', competitionId)
      .eq('fixture', fixture);

    if (stage) {
      query = query.eq('stage', stage);
    }

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;
    const matches = await attachMemberPredictions((data ?? []) as unknown as MatchListRow[], memberId);
    await prefetchMatchTeamLogos(matches);
    return matches;
  },
  // Get all competition matches with current Member predictions
  async getCompetitionMatchesWithMemberPredictions(
    competitionId: number,
    memberId: string,
  ): Promise<MatchWithPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(buildMatchListSelect())
      .eq('competition_id', competitionId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = await attachMemberPredictions((data ?? []) as unknown as MatchListRow[], memberId);
    await prefetchMatchTeamLogos(matches);

    return matches;
  },

  async getTournamentMatches(
    competitionId: number,
    memberId: string,
    stage: string,
  ): Promise<MatchWithPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(buildMatchListSelect())
      .eq('competition_id', competitionId)
      .eq('stage', stage)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = await attachMemberPredictions((data ?? []) as unknown as MatchListRow[], memberId);
    await prefetchMatchTeamLogos(matches);

    return matches;
  },

  async getTournamentMatchesByView(
    competitionId: number,
    memberId: string,
    view: TournamentView,
  ): Promise<MatchWithPredictionsType[]> {
    let query = supabase
      .from('matches')
      .select(buildMatchListSelect())
      .eq('competition_id', competitionId);

    query =
      view === 'groups'
        ? query.in('stage', FIRST_PHASE_STAGES)
        : query.in('stage', KNOCKOUT_STAGE_VALUES);

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = await attachMemberPredictions((data ?? []) as unknown as MatchListRow[], memberId);
    await prefetchMatchTeamLogos(matches);

    return matches;
  },
  async getTournamentActiveStage(
    competitionId: number,
  ): Promise<{ activeStage: string | null }> {
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
  async getTodayMatchesForCompetition(
    competitionId: number,
    memberId: string,
  ): Promise<MatchWithPredictionsType[]> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    ).toISOString();

    const { data, error } = await supabase
      .from('matches')
      .select(buildMatchListSelect())
      .eq('competition_id', competitionId)
      .gte('kick_off', startOfDay)
      .lte('kick_off', endOfDay)
      .order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const matches = await attachMemberPredictions((data ?? []) as unknown as MatchListRow[], memberId);
    void prefetchMatchTeamLogos(matches);
    return matches;
  },

  async getFinishedFixtures(competitionId: number): Promise<number[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('fixture')
      .eq('competition_id', competitionId)
      .eq('status', 'FINISHED')
      .not('fixture', 'is', null)
      .order('fixture', { ascending: true });

    if (error) throw error;

    const fixtureSet = new Set<number>();
    for (const row of data ?? []) {
      if (row.fixture != null) fixtureSet.add(row.fixture);
    }

    return Array.from(fixtureSet).sort((a, b) => a - b);
  },

  async getMemberFinishedMatches(
    memberId: string,
    competitionId: number,
    fixture: number,
  ): Promise<MatchWithPredictionsType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(buildMatchListSelect())
      .eq('competition_id', competitionId)
      .eq('status', 'FINISHED')
      .eq('fixture', fixture)
      .order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return attachMemberPredictions((data ?? []) as unknown as MatchListRow[], memberId);
  },
};
