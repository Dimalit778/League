import { supabase } from '@/lib/supabase';
import { matchesApi } from '../matchesApi';

describe('matchesApi.getMatchAiSummary', () => {
  it('calls the PRO-gated RPC with the match id', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: { ai_summary_en: 'A data-backed preview.', ai_summary_he: null },
      error: null,
    });
    const mockRpc = jest.fn().mockReturnValue({ single: mockSingle });
    (supabase as any).rpc = mockRpc;

    const result = await matchesApi.getMatchAiSummary(10);

    expect(mockRpc).toHaveBeenCalledWith('get_match_ai_summary', { p_match_id: 10 });
    expect(result).toEqual({ ai_summary_en: 'A data-backed preview.', ai_summary_he: null });
  });

  it('throws when the caller is not PRO (server rejects the RPC)', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'This feature requires a PRO subscription' },
    });
    const mockRpc = jest.fn().mockReturnValue({ single: mockSingle });
    (supabase as any).rpc = mockRpc;

    await expect(matchesApi.getMatchAiSummary(10)).rejects.toThrow('This feature requires a PRO subscription');
  });
});
