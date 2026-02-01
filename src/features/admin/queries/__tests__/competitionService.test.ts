import { supabase } from '@/lib/supabase';
import { competitionService } from '../competitionService';

describe('competitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all competitions', async () => {
    const mockData = [{ id: 1, name: 'Premier League' }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await competitionService.getCompetitions();
    expect(supabase.from).toHaveBeenCalledWith('competitions');
    expect(result).toEqual(mockData);
  });

  it('throws on error', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    });

    await expect(competitionService.getCompetitions()).rejects.toThrow('DB error');
  });
});
