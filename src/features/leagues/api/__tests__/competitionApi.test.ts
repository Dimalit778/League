import { supabase } from '@/lib/supabase';
import { competitionApi } from '../competitionApi';

describe('competitionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompetitions', () => {
    it('fetches competitions ordered with free leagues first', async () => {
      const mockData = [
        { id: 2021, name: 'Premier League', is_free: true },
        { id: 2014, name: 'La Liga', is_free: false },
      ];
      const queryChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn(),
      };

      queryChain.order.mockReturnValueOnce(queryChain).mockResolvedValueOnce({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue(queryChain);

      const result = await competitionApi.getCompetitions();

      expect(supabase.from).toHaveBeenCalledWith('competitions');
      expect(queryChain.select).toHaveBeenCalledWith('*');
      expect(queryChain.order).toHaveBeenNthCalledWith(1, 'is_free', { ascending: false });
      expect(queryChain.order).toHaveBeenNthCalledWith(2, 'name', { ascending: true });
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      const queryChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn(),
      };

      queryChain.order.mockReturnValueOnce(queryChain).mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

      (supabase.from as jest.Mock).mockReturnValue(queryChain);

      await expect(competitionApi.getCompetitions()).rejects.toThrow('DB error');
    });
  });

  describe('getCompetitionsDetails', () => {
    it('returns fixtures array and current fixture', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            current_matchday: 5,
            total_matchdays: 38,
            type: 'league',
            current_stage: 'LEAGUE',
            season_id: 2026,
          },
          error: null,
        }),
      });

      const result = await competitionApi.getCompetitionsDetails(1);
      expect(result.id).toBe(1);
      expect(result.currentMatchday).toBe(5);
      expect(result.totalMatchdays).toBe(38);
      expect(result.type).toBe('league');
      expect(result.currentStage).toBe('LEAGUE');
      expect(result.seasonId).toBe(2026);
      expect(result.allMatchdays).toHaveLength(38);
      expect(result.allMatchdays[0]).toBe(1);
      expect(result.allMatchdays[37]).toBe(38);
    });
  });
});
