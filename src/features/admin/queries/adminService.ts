import { ContentReportWithRelations, ModerationDecision, ReportStatus } from '@/features/moderation/types';
import {
  CompetitionWithCurrentSeason,
  CompetitionWithSeasonRows,
  normalizeCompetition,
} from '@/features/leagues/model/currentSeason';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/database.types';

export type CreateCompetitionInput = {
  id: number;
  name: string;
  area: string;
  code: string;
  flag: string;
  type: string;
  seasonId?: number | null;
  currentStage?: string | null;
};

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

type RawAdminPredictionRow = Tables<'predictions'> & {
  league: Pick<Tables<'leagues'>, 'id' | 'name'> | null;
  member: Pick<Tables<'league_members'>, 'id' | 'nickname'> | null;
  user: Pick<Tables<'users'>, 'id' | 'email' | 'full_name'> | null;
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

    // Delete the offending avatar file from storage after the DB detaches it.
    // The bucket policy allows admins to remove any profile image. Best-effort:
    // a failed cleanup must not fail an otherwise-successful moderation action.
    const removedAvatarPath = (data as { removed_avatar_path?: string | null })?.removed_avatar_path;
    if (removedAvatarPath) {
      const { error: storageError } = await supabase.storage
        .from('profile_images')
        .remove([removedAvatarPath]);
      if (storageError) {
        console.warn('Failed to delete moderated avatar from storage', storageError.message);
      }
    }

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

    const rows = (data ?? []) as unknown as RawAdminPredictionRow[];

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
      .select(`
        *,
        seasons(
          id,
          competition_id,
          current_matchday,
          current_stage,
          total_matchdays,
          season_start,
          season_end,
          is_current
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data ?? []) as unknown as CompetitionWithSeasonRows[]).map(normalizeCompetition);
  },

  async addCompetition(competition: CreateCompetitionInput) {
    const { data, error } = await supabase.rpc('admin_create_competition', {
      p_id: competition.id,
      p_name: competition.name,
      p_area: competition.area,
      p_code: competition.code,
      p_flag: competition.flag,
      p_type: competition.type,
      p_season_id: competition.seasonId ?? undefined,
      p_current_stage: competition.currentStage ?? undefined,
    });

    if (error) throw error;
    return data as unknown as CompetitionWithCurrentSeason;
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
