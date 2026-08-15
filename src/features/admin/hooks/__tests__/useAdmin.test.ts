import { KEYS } from '@/lib/queryClient';
import { useAuthStore } from '@/store/AuthStore';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useIsAdmin } from '../useAdmin';

describe('useIsAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      session: null,
      user: null,
      isAuthenticated: false,
      isAuthLoading: true,
    });
  });

  it('does not query before the authenticated session is ready', () => {
    renderHook(() => useIsAdmin());

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.admin.isAdmin(null),
        queryFn: undefined,
        enabled: false,
      }),
    );
  });

  it('uses a user-scoped key after authentication completes', () => {
    useAuthStore.setState({
      session: { user: { id: 'admin-1' } } as never,
      isAuthenticated: true,
      isAuthLoading: false,
    });

    renderHook(() => useIsAdmin());

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: KEYS.admin.isAdmin('admin-1'),
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );
  });
});
