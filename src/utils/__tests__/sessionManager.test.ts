import { supabase } from '@/lib/supabase';
import { getSession, setupSessionRefreshListener } from '../sessionManager';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('sessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSession', () => {
    it('should return session when successful', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' },
        access_token: 'token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should return null when session error occurs', async () => {
      const mockError = new Error('Session error');

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await getSession();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting session:', mockError);
    });

    it('should return null when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result).toBeNull();
    });

    it('should handle unexpected errors', async () => {
      const mockError = new Error('Unexpected error');
      mockSupabase.auth.getSession.mockRejectedValue(mockError);

      const result = await getSession();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Unexpected error getting session:', mockError);
    });
  });

  describe('setupSessionRefreshListener', () => {
    it('should set up auth state change listener', () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscription = { unsubscribe: mockUnsubscribe };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const result = setupSessionRefreshListener();

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSubscription);
    });

    it('should log TOKEN_REFRESHED events', () => {
      let authCallback: (event: string, session: any) => void;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      setupSessionRefreshListener();

      // Simulate TOKEN_REFRESHED event
      authCallback('TOKEN_REFRESHED', null);

      expect(console.log).toHaveBeenCalledWith('Session token refreshed successfully');
    });

    it('should log SIGNED_OUT events', () => {
      let authCallback: (event: string, session: any) => void;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      setupSessionRefreshListener();

      // Simulate SIGNED_OUT event
      authCallback('SIGNED_OUT', null);

      expect(console.log).toHaveBeenCalledWith('User signed out');
    });

    it('should log SIGNED_IN events', () => {
      let authCallback: (event: string, session: any) => void;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      setupSessionRefreshListener();

      // Simulate SIGNED_IN event
      authCallback('SIGNED_IN', { user: { id: 'user-1' } });

      expect(console.log).toHaveBeenCalledWith('User signed in');
    });
  });
});
