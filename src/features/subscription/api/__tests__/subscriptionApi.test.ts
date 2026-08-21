import { getCurrentSeason } from '../subscriptionApi';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

const mockedRpc = supabase.rpc as jest.Mock;

describe('getCurrentSeason', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps the current season row to camelCase', async () => {
    mockedRpc.mockResolvedValue({
      data: [{ code: '2026-27', starts_at: '2026-07-01T00:00:00Z', ends_at: '2027-07-01T00:00:00Z' }],
      error: null,
    });

    await expect(getCurrentSeason()).resolves.toEqual({
      code: '2026-27',
      startsAt: '2026-07-01T00:00:00Z',
      endsAt: '2027-07-01T00:00:00Z',
    });
    expect(mockedRpc).toHaveBeenCalledWith('get_current_season');
  });

  it('returns null when there is no current season', async () => {
    mockedRpc.mockResolvedValue({ data: [], error: null });
    await expect(getCurrentSeason()).resolves.toBeNull();
  });

  it('throws a user-facing error when the query fails', async () => {
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(getCurrentSeason()).rejects.toThrow();
  });
});
