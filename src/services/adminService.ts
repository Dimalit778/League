import { supabase } from '@/lib/supabase';
import { Tables, TablesInsert } from '@/types/database.types';

type DashboardCounts = {
  users: number;
  leagues: number;
  leagueMembers: number;
  predictions: number;
  subscriptions: number;
};

type LeagueWithRelations = Tables<'leagues'> & {
  owner?: Pick<Tables<'users'>, 'id' | 'full_name' | 'email'> | null;
  competition?: Pick<Tables<'competitions'>, 'id' | 'name' | 'country' | 'flag'> | null;
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
  async getDashboardCounts(): Promise<DashboardCounts> {
    const countTable = async (table: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count ?? 0;
    };

    const [users, leagues, leagueMembers, predictions, subscriptions] =
      await Promise.all([
        countTable('users'),
        countTable('leagues'),
        countTable('league_members'),
        countTable('predictions'),
        countTable('subscription'),
      ]);

    return { users, leagues, leagueMembers, predictions, subscriptions };
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Tables<'users'>[];
  },

  async getLeagues() {
    const { data, error } = await supabase
      .from('leagues')
      .select('*, owner:users(*), competition:competitions(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (
      data?.map((league) => ({
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
              country: league.competition.country,
              flag: league.competition.flag,
            }
          : null,
      })) ?? []
    ) as LeagueWithRelations[];
  },

  async getLeagueMembers() {
    const { data, error } = await supabase
      .from('league_members')
      .select('*, league:leagues(id, name), user:users(id, email, full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (
      data?.map((member) => ({
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
      })) ?? []
    ) as LeagueMemberWithRelations[];
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

    return (
      data?.map((prediction) => ({
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
      })) ?? []
    ) as PredictionWithRelations[];
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
};

export type {
  DashboardCounts,
  LeagueWithRelations,
  LeagueMemberWithRelations,
  PredictionWithRelations,
};
