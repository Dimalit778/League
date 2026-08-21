import { ContentReportWithRelations, ModerationDecision, ReportStatus } from '@/features/moderation/types';
import { supabase } from '@/lib/supabase';
import { Tables, TablesInsert } from '@/types/database.types';

type DashboardCounts = {
  users: number;
  leagues: number;
  leagueMembers: number;
  predictions: number;
  subscriptions: number;
  pendingReports: number;
};

type LeagueWithRelations = Tables<'leagues'> & {
  owner?: Pick<Tables<'users'>, 'id' | 'full_name' | 'email'> | null;
  competition?: Pick<
    Tables<'competitions'>,
    'id' | 'name' | 'area' | 'flag'
  > | null;
};

type LeagueMemberWithRelations = Tables<'league_members'> & {
  league?: Pick<Tables<'leagues'>, 'id' | 'name'> | null;
  user?: Pick<Tables<'users'>, 'id' | 'email' | 'full_name'> | null;
};

type PredictionWithRelations = Tables<'predictions'> & {
  league?: Pick<Tables<'leagues'>, 'id' | 'name'> | null;
  member?: Pick<Tables<'league_members'>, 'id' | 'nickname'> | null;
  user?: Pick<Tables<'users'>, 'id' | 'email' | 'full_name'> | null;
};

export const adminService = {
  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    return data === true;
  },
  async getDashboardCounts(): Promise<DashboardCounts> {
    const countTable = async (
      table:
        | 'users'
        | 'leagues'
        | 'league_members'
        | 'predictions'
        | 'user_subscriptions'
    ) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count ?? 0;
    };

    const [users, leagues, leagueMembers, predictions, subscriptions, pendingReportsResult] =
      await Promise.all([
        countTable('users'),
        countTable('leagues'),
        countTable('league_members'),
        countTable('predictions'),
        countTable('user_subscriptions'),
        supabase
          .from('content_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

    if (pendingReportsResult.error) throw pendingReportsResult.error;

    return {
      users,
      leagues,
      leagueMembers,
      predictions,
      subscriptions,
      pendingReports: pendingReportsResult.count ?? 0,
    };
  },

  async getContentReports(status: ReportStatus) {
    const { data, error } = await supabase
      .from('content_reports')
      .select(
        `*,
        reporter:users!content_reports_reporter_user_id_fkey(id, full_name, email),
        target:users!content_reports_target_user_id_fkey(id, full_name, email),
        league:leagues(id, name),
        member:league_members(id, nickname, avatar_url)
      `,
      )
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data ?? []) as ContentReportWithRelations[];
  },

  async moderateContentReport(reportId: string, decision: ModerationDecision, notes?: string | null) {
    const params = {
      p_report_id: reportId,
      p_decision: decision,
      ...(notes?.trim() ? { p_notes: notes.trim() } : {}),
    };
    const { data, error } = await supabase.rpc('moderate_content_report', params);

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to moderate report');
    return data;
  },

  async getUsers(page = 0, limit = 50) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data as Tables<'users'>[];
  },

  async getLeagues() {
    const { data, error } = await supabase
      .from('leagues')
      .select('*, owner:users(*), competition:competitions(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data?.map((league) => ({
      ...league,
      owner: league.owner
        ? {
            id: league.owner.id,
            full_name: league.owner.full_name,
            email: league.owner.email,
          }
        : null,
      competition: league.competition
        ? {
            id: league.competition.id,
            name: league.competition.name,
            area: league.competition.area,
            flag: league.competition.flag,
          }
        : null,
    })) ?? []) as LeagueWithRelations[];
  },

  async getLeagueMembers() {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues(id, name), user:users(id, email, full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data?.map((member) => ({
      ...member,
      league: member.league
        ? { id: member.league.id, name: member.league.name }
        : null,
      user: member.user
        ? {
            id: member.user.id,
            email: member.user.email,
            full_name: member.user.full_name,
          }
        : null,
    })) ?? []) as LeagueMemberWithRelations[];
  },

  async getPredictions() {
    const { data, error } = await supabase
      .from('predictions')
      .select(
        `*,
        league:leagues(id, name),
        member:league_members(id, nickname),
        user:users(id, email, full_name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const rows = (data ?? []) as any[];

    return rows.map((prediction) => ({
      ...prediction,
      league: prediction.league
        ? { id: prediction.league.id, name: prediction.league.name }
        : null,
      member: prediction.member
        ? {
            id: prediction.member.id,
            nickname: prediction.member.nickname,
          }
        : null,
      user: prediction.user
        ? {
            id: prediction.user.id,
            email: prediction.user.email,
            full_name: prediction.user.full_name,
          }
        : null,
    })) as PredictionWithRelations[];
  },

  async getCompetitions() {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Tables<'competitions'>[];
  },

  async addCompetition(competition: TablesInsert<'competitions'>) {
    const { data, error } = await supabase
      .from('competitions')
      .insert(competition)
      .select()
      .single();

    if (error) throw error;
    return data as Tables<'competitions'>;
  },

  async removeCompetition(competitionId: number) {
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId);

    if (error) throw error;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) throw error;
  },
};


export type {
  DashboardCounts,
  LeagueMemberWithRelations,
  LeagueWithRelations,
  PredictionWithRelations
};
