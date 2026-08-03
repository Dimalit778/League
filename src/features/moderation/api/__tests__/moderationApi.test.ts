import { supabase } from '@/lib/supabase';
import { moderationApi } from '../moderationApi';

describe('moderationApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads the current user block list through the protected rpc', async () => {
    const blockedUsers = [
      {
        id: 'b1',
        blocked_user_id: 'u2',
        created_at: '2026-08-02T12:00:00Z',
        display_name: 'Blocked nickname',
        avatar_url: 'avatar.jpg',
      },
    ];
    const mockRpc = jest.fn().mockResolvedValue({ data: blockedUsers, error: null });
    (supabase as any).rpc = mockRpc;

    await expect(moderationApi.getBlockedUsers()).resolves.toEqual(blockedUsers);
    expect(mockRpc).toHaveBeenCalledWith('get_blocked_users');
  });

  it('submits content reports through the protected rpc', async () => {
    const mockRpc = jest.fn().mockResolvedValue({
      data: { success: true, report_id: 'r1' },
      error: null,
    });
    (supabase as any).rpc = mockRpc;

    await moderationApi.submitReport({
      contentType: 'nickname',
      reason: 'harassment',
      leagueMemberId: 'm1',
      leagueId: 'l1',
      details: '  abusive nickname  ',
    });

    expect(mockRpc).toHaveBeenCalledWith('submit_content_report', {
      p_content_type: 'nickname',
      p_reason: 'harassment',
      p_league_member_id: 'm1',
      p_league_id: 'l1',
      p_details: 'abusive nickname',
    });
  });

  it('checks block status only in the current user block list', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ data: true, error: null });
    (supabase as any).rpc = mockRpc;

    await expect(moderationApi.isUserBlocked('u2')).resolves.toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('has_blocked_user', {
      p_target_user_id: 'u2',
    });
  });

  it.each([
    ['block_user', 'blockUser'],
    ['unblock_user', 'unblockUser'],
  ] as const)('uses %s for %s', async (rpcName, method) => {
    const mockRpc = jest.fn().mockResolvedValue({ data: { success: true }, error: null });
    (supabase as any).rpc = mockRpc;

    await moderationApi[method]('u2');

    expect(mockRpc).toHaveBeenCalledWith(rpcName, { p_target_user_id: 'u2' });
  });
});
