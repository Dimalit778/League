import { supabase } from "@/lib/supabase"
import { prefetchMatchTeamLogos } from "@/utils/prefetchTeamLogos"
import { FIRST_PHASE_STAGES, MatchCardType } from "../types"
import { KNOCKOUT_STAGE_VALUES, TournamentView } from "../utils/tournamentMatches"
import { mapMatchCardData, MATCH_WITH_MEMBER_PREDICTION } from "./matchesApi"
  // Get today matches
 export const notUsedMatchesApi = {   
 
  // Get all competition matches with current member's predictions

  async getTournamentMatches(
    competitionId: number,
    seasonId: number,
    memberId: string,
    stage: string,
  ): Promise<MatchCardType[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('season_id', seasonId)
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
    seasonId: number,
    memberId: string,
    view: TournamentView,
  ): Promise<MatchCardType[]> {
    let query = supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('season_id', seasonId)
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
    seasonId: number,
    memberId: string,
  ): Promise<MatchCardType | null> {
    const upcomingQuery = supabase
      .from('matches')
      .select(MATCH_WITH_MEMBER_PREDICTION)
      .eq('competition_id', competitionId)
      .eq('season_id', seasonId)
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
      .eq('season_id', seasonId)
      .eq('predictions.league_member_id', memberId)
      .order('kick_off', { ascending: false })
      .limit(1);

    if (latestError) throw latestError;
    if (!latest?.length) return null;

    return mapMatchCardData(latest)[0] ?? null;
  },
    // ---> Member details screen
    async getFinishedFixtures(competitionId: number, seasonId: number): Promise<number[]> {
      const { data, error } = await supabase
        .from('matches')
        .select('fixture')
        .eq('competition_id', competitionId)
        .eq('season_id', seasonId)
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
  
    // ---> Member details screen
    async getMemberFinishedMatches(
      memberId: string,
      competitionId: number,
      seasonId: number,
      fixture: number,
    ): Promise<MatchCardType[]> {
      const { data, error } = await supabase
        .from('matches')
        .select(MATCH_WITH_MEMBER_PREDICTION)
        .eq('competition_id', competitionId)
        .eq('season_id', seasonId)
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