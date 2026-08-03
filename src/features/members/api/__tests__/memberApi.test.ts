import { supabase } from '@/lib/supabase';
import { memberApi } from '../memberApi';

describe('memberApi moderation actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes a member through the owner-validated rpc', async () => {
    const mockRpc = jest.fn().mockResolvedValue({
      data: { success: true, league_id: 'l1', removed_member_id: 'm2' },
      error: null,
    });
    (supabase as any).rpc = mockRpc;

    const result = await memberApi.removeMember('m2');

    expect(mockRpc).toHaveBeenCalledWith('remove_league_member', { p_member_id: 'm2' });
    expect(result.leagueId).toBe('l1');
  });

  it('surfaces server authorization errors', async () => {
    (supabase as any).rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Only the league owner can remove a member' },
    });

    await expect(memberApi.removeMember('m2')).rejects.toThrow(
      'Only the league owner can remove a member',
    );
  });
});
