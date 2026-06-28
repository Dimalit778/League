import { supabase } from '@/lib/supabase';
import { predictionService } from '../predictionService';

describe('predictionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertPrediction', () => {
    it('upserts a prediction by member and match', async () => {
      const mockPrediction = {
        id: 'p1',
        league_member_id: 'm1',
        match_id: 42,
        home_score: 2,
        away_score: 1,
      };
      const single = jest.fn().mockResolvedValue({ data: mockPrediction, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const upsert = jest.fn().mockReturnValue({ select });
      (supabase.from as jest.Mock).mockReturnValue({ upsert });

      const result = await predictionService.upsertPrediction({
        league_member_id: 'm1',
        match_id: 42,
        home_score: 2,
        away_score: 1,
      });

      expect(supabase.from).toHaveBeenCalledWith('predictions');
      expect(upsert).toHaveBeenCalledWith(
        {
          league_member_id: 'm1',
          match_id: 42,
          home_score: 2,
          away_score: 1,
        },
        { onConflict: 'league_member_id,match_id' },
      );
      expect(result).toEqual(mockPrediction);
    });

    it('throws on upsert error', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
      const select = jest.fn().mockReturnValue({ single });
      const upsert = jest.fn().mockReturnValue({ select });
      (supabase.from as jest.Mock).mockReturnValue({ upsert });

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
