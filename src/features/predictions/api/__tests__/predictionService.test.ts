import { supabase } from '@/lib/supabase';
import { predictionService } from '../predictionService';

describe('predictionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPredictionsByLeagueFixture', () => {
    it('fetches predictions for a league fixture', async () => {
      const mockData = [{ id: 'p1', predicted_home_score: 2, predicted_away_score: 1 }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await predictionService.getPredictionsByLeagueFixture('l1', 5);
      expect(supabase.from).toHaveBeenCalledWith('my_predictions_view');
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
      });

      await expect(predictionService.getPredictionsByLeagueFixture('l1', 5)).rejects.toEqual({
        message: 'Error',
      });
    });
  });

  describe('upsertPrediction', () => {
    it('upserts a prediction', async () => {
      const mockPrediction = { id: 'p1', predicted_home_score: 2, predicted_away_score: 1 };
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockPrediction, error: null }),
          }),
        }),
      });

      const result = await predictionService.upsertPrediction({
        league_member_id: 'm1',
        match_id: 42,
        predicted_home_score: 2,
        predicted_away_score: 1,
      } as any);

      expect(supabase.from).toHaveBeenCalledWith('predictions');
      expect(result).toEqual(mockPrediction);
    });
  });

  describe('getMemberPredictionByFixture', () => {
    it('fetches prediction for a member and fixture', async () => {
      const mockPrediction = { id: 'p1' };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockPrediction, error: null }),
      });

      const result = await predictionService.getMemberPredictionByFixture('u1', 42);
      expect(supabase.from).toHaveBeenCalledWith('predictions');
      expect(result).toEqual(mockPrediction);
    });

    it('returns null when no prediction exists', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await predictionService.getMemberPredictionByFixture('u1', 42);
      expect(result).toBeNull();
    });
  });
});
