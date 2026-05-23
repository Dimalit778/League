import { supabase } from '@/lib/supabase';
import { standingsApi } from '../standingsService';

describe('standingsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches cached group standings for a season', async () => {
    const mockRows = [{ id: 1, group: 'A', position: 1 }];
    const eq = jest.fn().mockReturnThis();
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq,
      order: jest.fn().mockResolvedValue({ data: mockRows, error: null }),
    });

    const result = await standingsApi.getGroupStandings(100, 2026, 'A');

    expect(supabase.from).toHaveBeenCalledWith('competition_group_standings');
    expect(eq).toHaveBeenCalledWith('competition_id', 100);
    expect(eq).toHaveBeenCalledWith('group', 'GROUP_A');
    expect(eq).toHaveBeenCalledWith('season_id', 2026);
    expect(result).toEqual(mockRows);
  });

  it('supports current standings with a null season', async () => {
    const is = jest.fn().mockReturnThis();
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is,
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    await standingsApi.getGroupStandings(100, null, 'A');

    expect(is).toHaveBeenCalledWith('season_id', null);
  });
});
