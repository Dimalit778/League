import { supabase } from '@/lib/supabase';

const UPCOMING_WINDOW_DAYS = 7;
// iOS caps pending local notifications at 64; stay well below it.
const MAX_UPCOMING_MATCHES = 30;

export type UpcomingMatchType = {
  id: number;
  competition_id: number;
  kick_off: string;
  status: string | null;
  home_team: { name: string; shortName: string | null } | null;
  away_team: { name: string; shortName: string | null } | null;
};

export const notificationsApi = {
  // Upcoming (not started) matches of a competition inside the scheduling window
  async getUpcomingMatches(competitionId: number): Promise<UpcomingMatchType[]> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        id,
        competition_id,
        kick_off,
        status,
        home_team:teams!matches_home_team_id_fkey(name, shortName),
        away_team:teams!matches_away_team_id_fkey(name, shortName)
      `,
      )
      .eq('competition_id', competitionId)
      .in('status', ['SCHEDULED', 'TIMED'])
      .gte('kick_off', now.toISOString())
      .lte('kick_off', windowEnd.toISOString())
      .order('kick_off', { ascending: true })
      .limit(MAX_UPCOMING_MATCHES);

    if (error) throw error;
    return (data ?? []) as UpcomingMatchType[];
  },
};
