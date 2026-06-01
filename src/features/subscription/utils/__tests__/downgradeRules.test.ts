import {
  canCreateLeague,
  canCreateLeagueWithSize,
  canSubmitPrediction,
} from '../subscriptionGuards';

// Mock the Supabase client at the module level so it takes precedence over jest.setup.ts
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
const mockFrom = supabase.from as jest.Mock;

// Helper: build a subscription mock chain
// Matches the query: .from('subscription').select(...).eq(...).gte(...).order(...).maybeSingle()
function buildSubMock(subType: string | null) {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: subType ? { subscription_type: subType } : null,
    error: null,
  });
  const order = jest.fn().mockReturnValue({ maybeSingle });
  const gte = jest.fn().mockReturnValue({ order });
  const eq = jest.fn().mockReturnValue({ gte });
  const select = jest.fn().mockReturnValue({ eq });
  return { select };
}

// Helper: build a leagues mock returning an array of rows
// Matches: .from('leagues').select(...).eq('owner_id', ...).eq('status', 'ACTIVE')
function buildLeaguesMock(leagues: { id: string }[]) {
  const select = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: leagues, error: null }),
    }),
  });
  return { select };
}

// Helper: build a membership active-state mock
// Matches: .from('league_members').select(...).eq(...).eq(...).maybeSingle()
function buildMemberActiveMock(active: boolean) {
  const maybeSingle = jest
    .fn()
    .mockResolvedValue({ data: { active }, error: null });
  const secondEq = jest.fn().mockReturnValue({ maybeSingle });
  const firstEq = jest.fn().mockReturnValue({ eq: secondEq });
  const select = jest.fn().mockReturnValue({ eq: firstEq });
  return { select };
}

beforeEach(() => jest.clearAllMocks());

describe('downgrade rules — canCreateLeague', () => {
  it('free user with 1 owned active league cannot create another (allowed: false)', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock('FREE');
      if (table === 'leagues') return buildLeaguesMock([{ id: 'league-1' }]);
      return {};
    });

    const result = await canCreateLeague('user-free');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
    expect(result.reason).toContain('limit');
  });

  it('free user with 0 owned active leagues can create 1 (allowed: true)', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock(null); // null → defaults to FREE
      if (table === 'leagues') return buildLeaguesMock([]);
      return {};
    });

    const result = await canCreateLeague('user-free-empty');

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('paid user with 3 owned leagues cannot create more (allowed: false)', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock('BASIC');
      if (table === 'leagues')
        return buildLeaguesMock([{ id: 'l1' }, { id: 'l2' }, { id: 'l3' }]);
      return {};
    });

    const result = await canCreateLeague('user-pro-full');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });
});

describe('downgrade rules — canCreateLeagueWithSize', () => {
  it('free user cannot create a 10-member league (allowed: false)', async () => {
    mockFrom.mockImplementation(() => buildSubMock(null)); // null → FREE

    const result = await canCreateLeagueWithSize('user-free', 10);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('10');
  });

  it('paid user can create a 10-member league (allowed: true)', async () => {
    mockFrom.mockImplementation(() => buildSubMock('BASIC'));

    const result = await canCreateLeagueWithSize('user-paid', 10);

    expect(result.allowed).toBe(true);
  });
});

describe('downgrade rules — canSubmitPrediction', () => {
  it('returns allowed: false for inactive membership', async () => {
    mockFrom.mockImplementation(() => buildMemberActiveMock(false));

    const result = await canSubmitPrediction('user-1', 'league-locked');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('inactive');
  });

  it('returns allowed: true for active membership', async () => {
    mockFrom.mockImplementation(() => buildMemberActiveMock(true));

    const result = await canSubmitPrediction('user-1', 'league-active');

    expect(result.allowed).toBe(true);
  });
});
