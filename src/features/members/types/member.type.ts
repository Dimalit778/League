import { Tables } from '@/types/database.types';

type MemberType = Tables<'league_members'>;

type LeaderboardMember = Tables<'league_leaderboard_view'>;


export type {
  LeaderboardMember,
  MemberType
};
