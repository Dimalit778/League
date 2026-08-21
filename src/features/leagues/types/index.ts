import { MatchCardData } from "@/features/matches/utils/matchCard.mapper";
import { useMemberStats } from "@/features/members/hooks/useMemberStats";
import { Tables } from "@/types/database.types";

type CompetitionSummary = Pick<
  Tables<"competitions">,
  "id" | "name" | "logo" | "area" | "flag"
>;

type Competition = Pick<
  Tables<"competitions">,
  "id" | "name" | "logo" | "flag" | "area" | "type" | "current_stage" | "current_matchday" | "season_id" | "is_free"
>;

export type LeaderboardRow = Pick<
  Tables<"league_leaderboard_view">,
  | "avatar_url"
  | "league_id"
  | "member_id"
  | "nickname"
  | "total_points"
  | "user_id"
> & {
  correct_scores?: number;
};

export type MyLeague = Pick<
  Tables<"league_members">,
  | "active"
  | "avatar_url"
  | "created_at"
  | "id"
  | "is_primary"
  | "league_id"
  | "nickname"
  | "updated_at"
  | "user_id"
> & {
  league: Pick<
    Tables<"leagues">,
    "competition_id" | "created_at" | "id" | "join_code" | "max_members" | "name" | "owner_id" | "updated_at"
  > & {
    competition: Competition;
  };
};



export type MyLeaguesResponse = {
  primaryLeague: MyLeague | null;
  leagues: MyLeague[];
  inactiveLeagues: MyLeague[];
  total: number;
};


export type LeagueDetails = Pick<
  Tables<"leagues">,
  | "competition_id"
  | "created_at"
  | "id"
  | "join_code"
  | "max_members"
  | "name"
  | "owner_id"
  | "updated_at"
> & {
  competition: CompetitionSummary;
  league_members: Pick<
    Tables<"league_members">,
    | "active"
    | "avatar_url"
    | "created_at"
    | "id"
    | "is_primary"
    | "league_id"
    | "nickname"
    | "updated_at"
    | "user_id"
  >[];
};

export type LeagueSummary = Tables<"member_league_summary_view">;

export type LeagueWithCompetition = Omit<LeagueDetails, 'league_members'>;

type MemberStatsData = NonNullable<ReturnType<typeof useMemberStats>['data']>;

export type LeagueOverviewSummary = {
  nickname: string;
  avatarUrl: string | null;
  leagueName: string;
  logoUrl: string;
  flagUrl: string;
  rank: number;
  points: number;
  membersCount: number;
};

export type LeagueOverview = {
  leagueSummary: LeagueOverviewSummary;
  stats: MemberStatsData;
  upcomingMatches: MatchCardData[];
  isLoading: boolean;
};

export type FullLeague = {
  league_id: string;
  league_name: string;
  competition_name: string;
  competition_logo: string;
  competition_area: string;
  competition_flag: string;
  members_count: number;
  max_members: number;
  owner_nickname: string;
};


