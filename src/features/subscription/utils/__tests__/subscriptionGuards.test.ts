import { canCreateLeague, canCreateLeagueWithSize, canSubmitPrediction } from '../subscriptionGuards';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
const mockFrom = supabase.from as jest.Mock;

// Helper: build a subscription mock chain
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

// Helper: build a leagues mock returning an array
function buildLeaguesMock(leagues: { id: string }[]) {
  const select = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: leagues, error: null }),
    }),
  });
  return { select };
}

// Helper: build a single-league status mock
function buildLeagueStatusMock(status: 'ACTIVE' | 'LOCKED') {
  const single = jest.fn().mockResolvedValue({ data: { status }, error: null });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  return { select };
}

beforeEach(() => jest.clearAllMocks());

describe('canCreateLeague', () => {
  it('returns false for free user with 1 owned active league', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock('FREE');
      if (table === 'leagues') return buildLeaguesMock([{ id: 'l1' }]);
      return {};
    });
    const result = await canCreateLeague('user-1');
    expect(result.canCreate).toBe(false);
    expect(result.reason).toContain('limit');
  });

  it('returns true for free user with 0 owned active leagues', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock(null);
      if (table === 'leagues') return buildLeaguesMock([]);
      return {};
    });
    const result = await canCreateLeague('user-1');
    expect(result.canCreate).toBe(true);
  });

  it('returns true for pro user with 2 owned leagues', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock('PRO');
      if (table === 'leagues') return buildLeaguesMock([{ id: '1' }, { id: '2' }]);
      return {};
    });
    const result = await canCreateLeague('user-1');
    expect(result.canCreate).toBe(true);
  });

  it('returns false for pro user with 3 owned leagues', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'subscription') return buildSubMock('PRO');
      if (table === 'leagues') return buildLeaguesMock([{ id: '1' }, { id: '2' }, { id: '3' }]);
      return {};
    });
    const result = await canCreateLeague('user-1');
    expect(result.canCreate).toBe(false);
  });
});

describe('canCreateLeagueWithSize', () => {
  it('returns false for free user requesting 12 members', async () => {
    mockFrom.mockImplementation(() => buildSubMock(null));
    const result = await canCreateLeagueWithSize('user-1', 12);
    expect(result.canCreate).toBe(false);
  });

  it('returns true for pro user requesting 12 members', async () => {
    mockFrom.mockImplementation(() => buildSubMock('PRO'));
    const result = await canCreateLeagueWithSize('user-1', 12);
    expect(result.canCreate).toBe(true);
  });

  it('returns true for free user requesting 6 members', async () => {
    mockFrom.mockImplementation(() => buildSubMock(null));
    const result = await canCreateLeagueWithSize('user-1', 6);
    expect(result.canCreate).toBe(true);
  });
});

describe('canSubmitPrediction', () => {
  it('returns false for locked league', async () => {
    mockFrom.mockImplementation(() => buildLeagueStatusMock('LOCKED'));
    const result = await canSubmitPrediction('user-1', 'league-1');
    expect(result.canCreate).toBe(false);
  });

  it('returns true for active league', async () => {
    mockFrom.mockImplementation(() => buildLeagueStatusMock('ACTIVE'));
    const result = await canSubmitPrediction('user-1', 'league-1');
    expect(result.canCreate).toBe(true);
  });
});
