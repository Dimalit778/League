import { Tables } from '@/types/database.types';

export type ReportContentType = 'nickname' | 'avatar' | 'league_name';
export type ReportReason =
  | 'harassment'
  | 'hate'
  | 'sexual'
  | 'violence'
  | 'spam'
  | 'impersonation'
  | 'privacy'
  | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type ModerationDecision = 'dismiss' | 'remove_content' | 'remove_member';

export type SubmitReportInput = {
  contentType: ReportContentType;
  reason: ReportReason;
  leagueMemberId?: string | null;
  leagueId?: string | null;
  details?: string | null;
};

export type ContentReportWithRelations = Tables<'content_reports'> & {
  reporter?: Pick<Tables<'users'>, 'id' | 'full_name' | 'email'> | null;
  target?: Pick<Tables<'users'>, 'id' | 'full_name' | 'email'> | null;
  league?: Pick<Tables<'leagues'>, 'id' | 'name'> | null;
  member?: Pick<Tables<'league_members'>, 'id' | 'nickname' | 'avatar_url'> | null;
};

export type BlockedUserEntry = {
  id: string;
  blocked_user_id: string;
  created_at: string;
  display_name: string;
  avatar_url: string | null;
};
