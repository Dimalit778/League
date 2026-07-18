import { supabase } from '@/lib/supabase';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { MatchCardRawType, MatchCardType, MatchWithAllPredictionsType } from '../types';
import { FIRST_PHASE_STAGES } from '../types/footballStages';
import { KNOCKOUT_STAGE_VALUES, TournamentView } from '../utils/tournamentMatches';

const TEAM_LIST_FIELDS = `
  id,
  shortName,
  name,
  logo,
  tla
`;

const MATCH_WITH_MEMBER_PREDICTION = `
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
const MATCH_WITH_ALL_PREDICTIONS = `
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
    league_id,
    user_id,
    nickname,
    avatar_url,
    is_primary
  )
)
`;
function mapMatchCardData(data: unknown): MatchCardType[] {
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

  // Whole-season load feeding every Matches view (sliced client-side).
  async getSeasonMatches(competitionId: number, memberId: string): Promise<MatchCardType[]> {
    return this.getCompetitionMatchesWithMemberPredictions(competitionId, memberId);
  },

  // Get matches by fixture with current member's predictions
  async getMatchesByFixture({
    fixture,
    competitionId,
    memberId,
    stage,
  }: {
    fixture: number;
    competitionId: number;
    memberId: string;
    stage?: string;
  }): Promise<MatchCardType[]> {
    let query = supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
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
  // Get today matches
  async getTodayMatches(competitionId: number, memberId: string): Promise<MatchCardType[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
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
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .gte('kick_off', startOfDay)
      .lte('kick_off', endOfDay)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const matches = mapMatchCardData(data);
    void prefetchMatchTeamLogos(matches);

    return matches;
  },
  // Get all competition matches with current member's predictions
  async getCompetitionMatchesWithMemberPredictions(
    competitionId: number,
    memberId: string,
  ): Promise<MatchCardType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = mapMatchCardData(data);
    void prefetchMatchTeamLogos(matches);
    return matches;
  },
  async getTournamentMatches(
    competitionId: number,
    memberId: string,
    stage: string,
  ): Promise<MatchCardType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('stage', stage)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = mapMatchCardData(data);
    void prefetchMatchTeamLogos(matches);

    return matches;
  },

  async getTournamentMatchesByView(
    competitionId: number,
    memberId: string,
    view: TournamentView,
  ): Promise<MatchCardType[]> {
    let query = supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('predictions.league_member_id', memberId);

    query =
      view === 'groups'
        ? query.in('stage', FIRST_PHASE_STAGES)
        : query.in('stage', KNOCKOUT_STAGE_VALUES);

    const { data, error } = await query.order('kick_off', { ascending: true });

    if (error) throw error;

    const matches = mapMatchCardData(data);
    void prefetchMatchTeamLogos(matches);

    return matches;
  },

  async getNearestUpcomingMatch(
    competitionId: number,
    memberId: string,
  ): Promise<MatchCardType | null> {
    const upcomingQuery = supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('predictions.league_member_id', memberId)
      .neq('status', 'FINISHED')
      .order('kick_off', { ascending: true })
      .limit(1);

    const { data: upcoming, error: upcomingError } = await upcomingQuery;
    if (upcomingError) throw upcomingError;
    if (upcoming?.length) {
      return mapMatchCardData(upcoming)[0] ?? null;
    }

    const { data: latest, error: latestError } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: false })
      .limit(1);

    if (latestError) throw latestError;
    if (!latest?.length) return null;

    return mapMatchCardData(latest)[0] ?? null;
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
  ): Promise<MatchCardType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('status', 'FINISHED')
      .eq('fixture', fixture)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const matches = mapMatchCardData(data);
    return matches;
  },
};
