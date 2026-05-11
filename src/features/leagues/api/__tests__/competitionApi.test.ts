import { supabase } from '@/lib/supabase';
import { competitionApi } from '../competitionApi';

describe('competitionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompetitions', () => {
    it('fetches all competitions', async () => {
      const mockData = [{ id: 1, name: 'Premier League' }];
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await competitionApi.getCompetitions();
      expect(supabase.from).toHaveBeenCalledWith('competitions');
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      await expect(competitionApi.getCompetitions()).rejects.toThrow('DB error');
    });
  });

  describe('getCompetitionFixtures', () => {
    it('returns fixtures array and current fixture', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_fixture: 5, total_fixtures: 38, type: 'league' },
          error: null,
        }),
      });

      const result = await competitionApi.getCompetitionFixtures(1);
      expect(result.id).toBe(1);
      expect(result.currentFixture).toBe(5);
      expect(result.totalFixtures).toBe(38);
      expect(result.type).toBe('league');
      expect(result.allFixtures).toHaveLength(38);
      expect(result.allFixtures[0]).toBe(1);
      expect(result.allFixtures[37]).toBe(38);
    });
  });
});
