import { LeaderboardMember } from "@/features/members/types/member.type";
import { supabase } from "@/lib/supabase";
import {
  LeaderboardRow,
  LeagueSummary,
  MyLeague,
  MyLeaguesResponse,
} from "../types";
import {
  CompetitionWithSeasonRows,
  normalizeCompetition,
} from "../model/currentSeason";

const LEADERBOARD_SELECT =
  "avatar_url, league_id, member_id, nickname, total_points, user_id";
const COMPETITION_SELECT =
  "id, name, area, flag, type, is_free, seasons(id, competition_id, current_matchday, current_stage, total_matchdays, season_start, season_end, is_current)";
const MY_LEAGUES_SELECT = `
  active,
  avatar_url,
  created_at,
  id,
  is_primary,
  league_id,
  nickname,
  updated_at,
  user_id,
  league:leagues!league_id(
    competition_id,
    created_at,
    id,
    join_code,
    max_members,
    name,
    owner_id,
    updated_at,
    competition:competitions(${COMPETITION_SELECT})
  )
`;
const LEAGUE_WITH_COMPETITION_SELECT = `
  competition_id,
  created_at,
  id,
  join_code,
  max_members,
  name,
  owner_id,
  updated_at,
  competition:competitions(${COMPETITION_SELECT})
`;
const LEAGUE_WITH_MEMBERS_SELECT = `
  ${LEAGUE_WITH_COMPETITION_SELECT},
  league_members(
    active,
    anonymized_at,
    avatar_url,
    created_at,
    id,
    is_primary,
    league_id,
    nickname,
    updated_at,
    user_id
  )
`;

type RawMyLeague = Omit<MyLeague, "league"> & {
  league: Omit<MyLeague["league"], "competition"> & {
    competition: CompetitionWithSeasonRows;
  };
};

function normalizeMyLeague(membership: RawMyLeague): MyLeague {
  return {
    ...membership,
    league: {
      ...membership.league,
      competition: normalizeCompetition(membership.league.competition),
    },
  };
}

export const leagueApi = {
  async getLeaderboardView(leagueId: string) {
    const { data, error } = await supabase
      .from("league_leaderboard_view")
      .select(LEADERBOARD_SELECT)
      .eq("league_id", leagueId)
      .order("total_points", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []) as LeaderboardRow[];
    if (rows.length === 0) return rows;

    const memberIds = rows.map((row) => row.member_id).filter((
      id,
    ): id is string => !!id);
    const { data: predictions, error: predictionsError } = await supabase
      .from("predictions")
      .select("league_member_id")
      .in("league_member_id", memberIds)
      .eq("is_finished", true)
      .eq("points", 5);

    if (predictionsError) throw predictionsError;

    const correctScoreCounts = new Map<string, number>();
    for (const prediction of predictions ?? []) {
      const memberId = prediction.league_member_id;
      correctScoreCounts.set(
        memberId,
        (correctScoreCounts.get(memberId) ?? 0) + 1,
      );
    }

    return rows.map((row) => ({
      ...row,
      correct_scores: row.member_id
        ? (correctScoreCounts.get(row.member_id) ?? 0)
        : 0,
    }));
  },
  async getCompetitionLeaderboard(
    competitionId: number,
  ): Promise<LeaderboardMember[]> {
    const { data, error } = await supabase.rpc("get_competition_leaderboard", {
      p_competition_id: competitionId,
    });

    if (error) throw new Error(error.message);

    return ((data ?? []) as LeaderboardMember[]).sort((a, b) =>
      (b.total_points ?? 0) - (a.total_points ?? 0)
    );
  },
  async getMyLeaguesSummary(userId: string): Promise<LeagueSummary[]> {
    const { data: members, error: membersError } = await supabase
      .from("league_members")
      .select("id")
      .eq("user_id", userId);

    if (membersError) throw new Error(membersError.message);

    const memberIds = (members ?? []).map((m) => m.id);
    if (memberIds.length === 0) return [];

    const { data, error } = await supabase
      .from("member_league_summary_view")
      .select("*")
      .in("member_id", memberIds);

    if (error) throw new Error(error.message);
    return (data as LeagueSummary[]) ?? [];
  },

  async getMyLeagues(userId: string): Promise<MyLeaguesResponse> {
    const { data, error } = await supabase
      .from("league_members")
      .select(MY_LEAGUES_SELECT)
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("active", { ascending: false });

    if (error) throw new Error(error.message);

    const memberships = ((data ?? []) as unknown as RawMyLeague[]).map(normalizeMyLeague);

    return {
      primaryLeague: memberships.find((league) => league.is_primary) ?? null,
      leagues: memberships.filter((league) =>
        !league.is_primary && league.active
      ),
      inactiveLeagues: memberships.filter((league) =>
        !league.is_primary && !league.active
      ),
      total: memberships.length,
    };
  },

  async getLeagueAndMembers(leagueId: string) {
    const { data: leagueData, error: leagueError } = await supabase
      .from("leagues")
      .select(LEAGUE_WITH_MEMBERS_SELECT)
      .eq("id", leagueId)
      .single();

    if (leagueError) throw new Error(leagueError.message);

    return {
      ...leagueData,
      competition: normalizeCompetition(
        leagueData.competition as unknown as CompetitionWithSeasonRows,
      ),
    };
  },
  async getLeagueWithCompetition(leagueId: string) {
    const { data, error } = await supabase
      .from("leagues")
      .select(LEAGUE_WITH_COMPETITION_SELECT)
      .eq("id", leagueId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("League not found");

    return {
      ...data,
      competition: normalizeCompetition(
        data.competition as unknown as CompetitionWithSeasonRows,
      ),
    };
  },

  async updatePrimaryLeague(leagueId: string) {
    const { data, error } = await supabase.rpc("set_primary_league", {
      p_league_id: leagueId,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to set primary league");

    return data;
  },

  async updateMyLeagueActivation(activeMemberIds: string[]) {
    const { data, error } = await supabase.rpc("update_my_league_activation", {
      p_active_member_ids: activeMemberIds,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Failed to update active leagues");

    return data;
  },
  async findLeagueByJoinCode(joinCode: string) {
    const { data, error } = await supabase.rpc("find_league_by_code", {
      p_join_code: joinCode,
    });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("League not found");

    const league = data[0];

    return league;
  },

  async getOwnedLeagues(userId: string) {
    const { data, error } = await supabase
      .from("leagues")
      .select("id, name, updated_at, competition:competitions(id, name, flag)")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
