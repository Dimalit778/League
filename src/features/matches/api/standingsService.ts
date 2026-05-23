import { supabase } from '@/lib/supabase';
import { GroupStandingType } from '../types';
import { toTournamentGroupValue } from '../utils/tournamentMatches';

export const standingsApi = {
  async getGroupStandings(
    competitionId: number,
    seasonId: number | null | undefined,
    group: string,
  ): Promise<GroupStandingType[]> {
    let query = supabase
      .from('competition_group_standings')
      .select(
        `
        *,
        team:teams!competition_group_standings_team_id_fkey(*)
      `,
      )
      .eq('competition_id', competitionId)
      .eq('group', toTournamentGroupValue(group));

    query = seasonId == null ? query.is('season_id', null) : query.eq('season_id', seasonId);

    const { data, error } = await query.order('position', { ascending: true });

    if (error) throw error;
    return (data ?? []) as GroupStandingType[];
  },
};
