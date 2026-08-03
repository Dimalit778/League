import { supabase } from '@/lib/supabase';
import { BlockedUserEntry, SubmitReportInput } from '../types';

export const moderationApi = {
  async getBlockedUsers() {
    const { data, error } = await supabase.rpc('get_blocked_users');

    if (error) throw new Error(error.message);
    return (data ?? []) as BlockedUserEntry[];
  },

  async submitReport(input: SubmitReportInput) {
    const params = {
      p_content_type: input.contentType,
      p_reason: input.reason,
      ...(input.leagueMemberId ? { p_league_member_id: input.leagueMemberId } : {}),
      ...(input.leagueId ? { p_league_id: input.leagueId } : {}),
      ...(input.details?.trim() ? { p_details: input.details.trim() } : {}),
    };
    const { data, error } = await supabase.rpc('submit_content_report', params);

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to submit report');
    return data;
  },

  async isUserBlocked(targetUserId: string) {
    const { data, error } = await supabase.rpc('has_blocked_user', {
      p_target_user_id: targetUserId,
    });

    if (error) throw new Error(error.message);
    return data === true;
  },

  async blockUser(targetUserId: string) {
    const { data, error } = await supabase.rpc('block_user', {
      p_target_user_id: targetUserId,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to block user');
    return data;
  },

  async unblockUser(targetUserId: string) {
    const { data, error } = await supabase.rpc('unblock_user', {
      p_target_user_id: targetUserId,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to unblock user');
    return data;
  },
};
