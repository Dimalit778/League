import { supabase } from '@/lib/supabase';
import { formatTestResults, quickAdminCheck, testAdminAccess } from '../testAdminAccess';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('testAdminAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return failure when no session exists', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await testAdminAccess();

    expect(result.success).toBe(false);
    expect(result.tests).toHaveLength(1);
    expect(result.tests[0].name).toBe('Session Check');
    expect(result.tests[0].status).toBe('fail');
  });

  it('should return failure when user is not admin', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-1', role: 'USER' },
            error: null,
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation(mockFrom);

    const result = await testAdminAccess();

    expect(result.success).toBe(false);
    expect(result.currentUser.role).toBe('USER');
    expect(result.tests.some((test) => test.name === 'Admin Role Check' && test.status === 'fail')).toBe(true);
  });

  it('should run all tests successfully for admin user', async () => {
    const mockSession = {
      user: { id: 'admin-1', email: 'admin@example.com' },
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock all database calls to return success
    const mockFrom = jest.fn().mockImplementation((table: string) => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: table === 'users' ? { id: 'admin-1', role: 'ADMIN' } : null,
            error: null,
          }),
        }),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    }));

    mockSupabase.from.mockImplementation(mockFrom);

    const result = await testAdminAccess();

    expect(result.success).toBe(true);
    expect(result.currentUser.role).toBe('ADMIN');
    expect(result.tests.length).toBeGreaterThan(5); // Should have multiple tests
    expect(result.tests.every((test) => test.status === 'pass')).toBe(true);
  });
});

describe('quickAdminCheck', () => {
  it('should return boolean result from testAdminAccess', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await quickAdminCheck();
    expect(typeof result).toBe('boolean');
    expect(result).toBe(false);
  });
});

describe('formatTestResults', () => {
  it('should format test results as readable string', () => {
    const mockResults = {
      success: true,
      timestamp: '2024-01-01T00:00:00Z',
      currentUser: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN',
      },
      tests: [
        {
          name: 'Test 1',
          status: 'pass' as const,
          message: 'Success',
        },
        {
          name: 'Test 2',
          status: 'fail' as const,
          message: 'Failed',
        },
      ],
    };

    const formatted = formatTestResults(mockResults);

    expect(formatted).toContain('ADMIN ACCESS TEST RESULTS');
    expect(formatted).toContain('✅ PASS');
    expect(formatted).toContain('test@example.com');
    expect(formatted).toContain('ADMIN');
    expect(formatted).toContain('Test 1');
    expect(formatted).toContain('Test 2');
  });
});
