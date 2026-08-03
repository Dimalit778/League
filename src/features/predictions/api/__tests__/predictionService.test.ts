import { supabase } from '@/lib/supabase';
import { predictionService } from '../predictionService';

describe('predictionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertPrediction', () => {
    it('calls the protected RPC with only user-controlled score fields', async () => {
      const mockPrediction = {
        id: 'p1',
        league_member_id: 'm1',
        match_id: 42,
        home_score: 2,
        away_score: 1,
      };
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: mockPrediction, error: null });

      const result = await predictionService.upsertPrediction({
        league_member_id: 'm1',
        match_id: 42,
        home_score: 2,
        away_score: 1,
      });

      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.rpc).toHaveBeenCalledWith('upsert_own_prediction', {
        p_league_member_id: 'm1',
        p_match_id: 42,
        p_home_score: 2,
        p_away_score: 1,
      });
      expect(result).toEqual(mockPrediction);
    });

    it('throws on RPC error', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: 'Error' } });

      await expect(
        predictionService.upsertPrediction({
          league_member_id: 'm1',
          match_id: 42,
          home_score: 2,
          away_score: 1,
        }),
      ).rejects.toEqual({ message: 'Error' });
    });
  });
});
