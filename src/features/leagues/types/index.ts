import { Tables } from "@/types/database.types";

type CompetitionSummary = Pick<
  Tables<"competitions">,
  "id" | "name" | "logo" | "area" | "flag"
>;

type CompetitionType = Pick<
  Tables<"competitions">,
  "id" | "name" | "logo" | "flag" | "type" | "current_stage" | "current_fixture"
>;

type LeaderboardRow = Pick<
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

type MyLeagueType = Pick<
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
    competition: CompetitionType;
  };
};

type LeagueDetailsType = Pick<
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

type MyLeaguesResponseType = {
  primaryLeague: MyLeagueType | null;
  leagues: MyLeagueType[];
  inactiveLeagues: MyLeagueType[];
  total: number;
};

type MemberLeagueSummaryType = Tables<"member_league_summary_view">;

type LeagueWithCompetitionType = Omit<LeagueDetailsType, 'league_members'>;

type FullLeagueType = {
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


export {
  FullLeagueType,
  LeaderboardRow,
  LeagueDetailsType,
  LeagueWithCompetitionType,
  MemberLeagueSummaryType,
  MyLeaguesResponseType, MyLeagueType
};

