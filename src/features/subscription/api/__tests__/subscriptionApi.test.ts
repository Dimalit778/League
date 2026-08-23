import { getCurrentSeason, getMySubscriptionAccess, getSubscriptionPlans } from '../subscriptionApi';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: jest.fn(), from: jest.fn() },
}));

const mockedRpc = supabase.rpc as jest.Mock;
const mockedFrom = supabase.from as jest.Mock;

describe('getSubscriptionPlans', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps the active plan catalog to client fields', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [{
        code: 'pro',
        rank: 10,
        is_default: false,
        name_en: 'Pro',
        name_he: 'פרו',
        description_en: null,
        description_he: null,
        max_active_leagues: 5,
        max_members_per_league: 12,
        can_use_premium_competitions: true,
        weekly_ai_analyses: null,
        has_advanced_stats: true,
        sort_order: 10,
      }],
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq });
    mockedFrom.mockReturnValue({ select });

    await expect(getSubscriptionPlans()).resolves.toEqual([{
      code: 'pro',
      rank: 10,
      isDefault: false,
      nameEn: 'Pro',
      nameHe: 'פרו',
      descriptionEn: null,
      descriptionHe: null,
      limits: {
        maxActiveLeagues: 5,
        maxMembersPerLeague: 12,
        weeklyAiAnalyses: null,
      },
      capabilities: {
        premiumCompetitions: true,
        advancedStats: true,
      },
      sortOrder: 10,
    }]);
    expect(mockedFrom).toHaveBeenCalledWith('subscription_plans');
    expect(eq).toHaveBeenCalledWith('is_active', true);
  });
});

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

describe('getMySubscriptionAccess', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps server subscription access to client fields', async () => {
    mockedRpc.mockResolvedValue({
      data: {
        plan_code: 'pro',
        is_default: false,
        status: 'active',
        expires_at: '2027-08-01T00:00:00Z',
        limits: {
          max_active_leagues: 5,
          max_members_per_league: 12,
          weekly_ai_analyses: 10,
        },
        capabilities: {
          premium_competitions: true,
          advanced_stats: true,
        },
      },
      error: null,
    });

    await expect(getMySubscriptionAccess()).resolves.toEqual({
      planCode: 'pro',
      isDefault: false,
      status: 'active',
      expiresAt: '2027-08-01T00:00:00Z',
      limits: {
        maxActiveLeagues: 5,
        maxMembersPerLeague: 12,
        weeklyAiAnalyses: 10,
      },
      capabilities: {
        premiumCompetitions: true,
        advancedStats: true,
      },
    });
    expect(mockedRpc).toHaveBeenCalledWith('get_my_subscription_access');
  });

  it('throws a user-facing error when access lookup fails', async () => {
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(getMySubscriptionAccess()).rejects.toThrow();
  });
});
